import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCodeDocuments, createCodeDocument, deleteCodeDocument } from '@/db/api';
import type { CodeDocumentWithAccess } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Code2, Plus, MoreVertical, Trash2, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚙️' },
  { value: 'csharp', label: 'C#', icon: '🔷' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'ruby', label: 'Ruby', icon: '💎' },
  { value: 'swift', label: 'Swift', icon: '🦅' },
  { value: 'kotlin', label: 'Kotlin', icon: '🟣' },
  { value: 'html', label: 'HTML', icon: '🌐' },
  { value: 'css', label: 'CSS', icon: '🎨' },
  { value: 'sql', label: 'SQL', icon: '🗄️' },
  { value: 'shell', label: 'Shell', icon: '🐚' },
];

export default function CodeDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [codeDocuments, setCodeDocuments] = useState<CodeDocumentWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCodeTitle, setNewCodeTitle] = useState('');
  const [newCodeLanguage, setNewCodeLanguage] = useState('javascript');

  useEffect(() => {
    if (user) {
      loadCodeDocuments();
    }
  }, [user]);

  const loadCodeDocuments = async () => {
    if (!user) return;
    setLoading(true);
    const docs = await getCodeDocuments(user.id);
    setCodeDocuments(docs);
    setLoading(false);
  };

  const handleCreateCode = async () => {
    if (!user || !newCodeTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    const newCode = await createCodeDocument(newCodeTitle.trim(), newCodeLanguage, user.id);
    setCreating(false);

    if (newCode) {
      toast({
        title: 'Success',
        description: 'Code document created successfully',
      });
      setShowCreateDialog(false);
      setNewCodeTitle('');
      setNewCodeLanguage('javascript');
      navigate(`/code/${newCode.id}`);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create code document',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCode = async (codeId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    const success = await deleteCodeDocument(codeId);
    if (success) {
      toast({
        title: 'Success',
        description: 'Code document deleted',
      });
      loadCodeDocuments();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete code document',
        variant: 'destructive',
      });
    }
  };

  const getLanguageInfo = (language: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.value === language) || SUPPORTED_LANGUAGES[0];
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-48 bg-muted" />
          <Skeleton className="h-10 w-40 bg-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Code2 className="h-8 w-8" />
            My Code Documents
          </h1>
          <p className="text-muted-foreground mt-2">
            Collaborate on code with syntax highlighting and real-time editing
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Code Document</DialogTitle>
              <DialogDescription>
                Choose a programming language and start coding collaboratively
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter code document title"
                  value={newCodeTitle}
                  onChange={(e) => setNewCodeTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !creating) {
                      handleCreateCode();
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Programming Language</label>
                <Select value={newCodeLanguage} onValueChange={setNewCodeLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        <span className="flex items-center gap-2">
                          <span>{lang.icon}</span>
                          <span>{lang.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCode} disabled={creating || !newCodeTitle.trim()}>
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {codeDocuments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Code2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No code documents yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first code document to start collaborating
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Code Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {codeDocuments.map((code) => {
            const langInfo = getLanguageInfo(code.language);
            return (
              <Card
                key={code.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/code/${code.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-2xl">{langInfo.icon}</span>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="truncate">{code.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {langInfo.label}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCode(code.id, code.title);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="truncate">
                        {code.access_role === 'owner' ? 'Owner' : 'Collaborator'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatDistanceToNow(new Date(code.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
