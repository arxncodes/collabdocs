import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Users, Clock, Trash2 } from 'lucide-react';
import { getMyDocuments, getSharedDocuments, createDocument, deleteDocument } from '@/db/api';
import type { DocumentWithAccess } from '@/types/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [myDocuments, setMyDocuments] = useState<DocumentWithAccess[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<DocumentWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;
    setLoading(true);
    const [myDocs, sharedDocs] = await Promise.all([
      getMyDocuments(user.id),
      getSharedDocuments(user.id),
    ]);
    setMyDocuments(myDocs);
    setSharedDocuments(sharedDocs);
    setLoading(false);
  };

  const handleCreateDocument = async () => {
    if (!user) return;
    setCreating(true);
    const doc = await createDocument(newDocTitle || 'Untitled Document', user.id);
    setCreating(false);

    if (doc) {
      toast({
        title: 'Success',
        description: 'Document created successfully',
      });
      setCreateDialogOpen(false);
      setNewDocTitle('');
      navigate(`/editor/${doc.id}`);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create document',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    const success = await deleteDocument(documentToDelete);
    if (success) {
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
      setMyDocuments(myDocuments.filter((doc) => doc.id !== documentToDelete));
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const DocumentCard = ({ doc }: { doc: DocumentWithAccess }) => {
    const isOwner = doc.access_role === 'owner';
    const canEdit = isOwner || doc.access_role === 'editor';

    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader onClick={() => navigate(`/editor/${doc.id}`)}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{doc.title}</CardTitle>
              <CardDescription className="mt-1">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>Updated {formatDate(doc.updated_at)}</span>
                </div>
              </CardDescription>
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setDocumentToDelete(doc.id);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent onClick={() => navigate(`/editor/${doc.id}`)}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{doc.collaborators_count || 0} collaborators</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  isOwner
                    ? 'bg-primary/10 text-primary'
                    : canEdit
                      ? 'bg-chart-2/10 text-chart-2'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isOwner ? 'Owner' : doc.access_role}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <div className="grid gap-4 xl:grid-cols-3 lg:grid-cols-2 grid-cols-1">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 bg-muted" />
            <Skeleton className="h-4 w-1/2 bg-muted" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Documents</h1>
            <p className="text-muted-foreground mt-1">Create and manage your collaborative documents</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>

        <Tabs defaultValue="my-documents" className="w-full">
          <TabsList>
            <TabsTrigger value="my-documents">
              <FileText className="mr-2 h-4 w-4" />
              My Documents ({myDocuments.length})
            </TabsTrigger>
            <TabsTrigger value="shared">
              <Users className="mr-2 h-4 w-4" />
              Shared with Me ({sharedDocuments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-documents" className="mt-6">
            {loading ? (
              <LoadingSkeleton />
            ) : myDocuments.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first document to get started
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Document
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 xl:grid-cols-3 lg:grid-cols-2 grid-cols-1">
                {myDocuments.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shared" className="mt-6">
            {loading ? (
              <LoadingSkeleton />
            ) : sharedDocuments.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No shared documents</h3>
                  <p className="text-muted-foreground">
                    Documents shared with you will appear here
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 xl:grid-cols-3 lg:grid-cols-2 grid-cols-1">
                {sharedDocuments.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Document Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
            <DialogDescription>Give your document a title to get started</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                placeholder="Untitled Document"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateDocument();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDocument} disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
