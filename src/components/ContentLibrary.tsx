import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Copy,
  Plus,
  Edit,
  Trash2,
  FileText,
  Lightbulb,
  AlignLeft,
  Type,
  Code,
  Quote,
  Link as LinkIcon,
  Check,
} from 'lucide-react';
import {
  getContentSnippets,
  searchContentSnippets,
  createContentSnippet,
  updateContentSnippet,
  deleteContentSnippet,
} from '@/db/contentSnippets';
import type { ContentSnippet, ContentCategory } from '@/types/types';

const categoryIcons: Record<ContentCategory, React.ReactNode> = {
  blog: <FileText className="h-4 w-4" />,
  topic: <Lightbulb className="h-4 w-4" />,
  paragraph: <AlignLeft className="h-4 w-4" />,
  text: <Type className="h-4 w-4" />,
  code: <Code className="h-4 w-4" />,
  quote: <Quote className="h-4 w-4" />,
  link: <LinkIcon className="h-4 w-4" />,
};

const categoryLabels: Record<ContentCategory, string> = {
  blog: 'Blog',
  topic: 'Topic',
  paragraph: 'Paragraph',
  text: 'Text',
  code: 'Code',
  quote: 'Quote',
  link: 'Link',
};

export function ContentLibrary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<ContentSnippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<ContentSnippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add/Edit Dialog State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<ContentSnippet | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'text' as ContentCategory,
    tags: [] as string[],
  });

  // Load snippets
  useEffect(() => {
    if (user) {
      loadSnippets();
    }
  }, [user]);

  // Filter snippets
  useEffect(() => {
    filterSnippets();
  }, [snippets, searchQuery, selectedCategory]);

  const loadSnippets = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getContentSnippets(user.id);
    setSnippets(data);
    setLoading(false);
  };

  const filterSnippets = async () => {
    if (!user) return;

    if (searchQuery.trim() || selectedCategory !== 'all') {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const results = await searchContentSnippets(user.id, searchQuery, category);
      setFilteredSnippets(results);
    } else {
      setFilteredSnippets(snippets);
    }
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: 'Copied to clipboard',
        description: 'Content has been copied successfully',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy content to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleAdd = async () => {
    if (!user || !formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in title and content',
        variant: 'destructive',
      });
      return;
    }

    const newSnippet = await createContentSnippet(user.id, formData);
    if (newSnippet) {
      setSnippets([newSnippet, ...snippets]);
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: 'Snippet added',
        description: 'Your content snippet has been saved',
      });
    } else {
      toast({
        title: 'Failed to add snippet',
        description: 'Could not save the content snippet',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async () => {
    if (!editingSnippet || !formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in title and content',
        variant: 'destructive',
      });
      return;
    }

    const updated = await updateContentSnippet(editingSnippet.id, formData);
    if (updated) {
      setSnippets(snippets.map((s) => (s.id === updated.id ? updated : s)));
      setIsEditDialogOpen(false);
      setEditingSnippet(null);
      resetForm();
      toast({
        title: 'Snippet updated',
        description: 'Your content snippet has been updated',
      });
    } else {
      toast({
        title: 'Failed to update snippet',
        description: 'Could not update the content snippet',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteContentSnippet(id);
    if (success) {
      setSnippets(snippets.filter((s) => s.id !== id));
      toast({
        title: 'Snippet deleted',
        description: 'Your content snippet has been deleted',
      });
    } else {
      toast({
        title: 'Failed to delete snippet',
        description: 'Could not delete the content snippet',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (snippet: ContentSnippet) => {
    setEditingSnippet(snippet);
    setFormData({
      title: snippet.title,
      content: snippet.content,
      category: snippet.category,
      tags: snippet.tags,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'text',
      tags: [],
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Content Library</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Content Snippet</DialogTitle>
                <DialogDescription>
                  Save content for quick access and reuse
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value as ContentCategory })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {categoryIcons[key as ContentCategory]}
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter content"
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd}>Add Snippet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search snippets..."
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value as ContentCategory | 'all')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  {categoryIcons[key as ContentCategory]}
                  {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading...</div>
          ) : filteredSnippets.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {searchQuery || selectedCategory !== 'all'
                ? 'No snippets found'
                : 'No snippets yet. Add your first snippet!'}
            </div>
          ) : (
            filteredSnippets.map((snippet) => (
              <Card key={snippet.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium truncate">
                        {snippet.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        <Badge variant="secondary" className="text-xs">
                          <span className="mr-1">{categoryIcons[snippet.category]}</span>
                          {categoryLabels[snippet.category]}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(snippet.content, snippet.id)}
                        className="h-8 w-8 p-0"
                      >
                        {copiedId === snippet.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(snippet)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(snippet.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                    {snippet.content}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Content Snippet</DialogTitle>
            <DialogDescription>Update your content snippet</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter title"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as ContentCategory })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {categoryIcons[key as ContentCategory]}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter content"
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingSnippet(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Snippet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
