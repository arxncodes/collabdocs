import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  History,
  Save,
  Loader2,
  Download,
  FileText,
  FileType,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getDocument,
  getDocumentContent,
  updateDocumentContent,
  updateDocument,
  getCollaborators,
  getComments,
  getActiveUsers,
  updatePresence,
  removePresence,
  getDocumentVersions,
  createDocumentVersion,
} from '@/db/api';
import type {
  Document,
  DocumentContent,
  Collaborator,
  Comment,
  ActiveUser,
  DocumentVersion,
  EditorContent,
} from '@/types/types';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { CollaboratorsSidebar } from '@/components/editor/CollaboratorsSidebar';
import { CommentsPanel } from '@/components/editor/CommentsPanel';
import { PresenceIndicator } from '@/components/editor/PresenceIndicator';
import { VersionHistoryDialog } from '@/components/editor/VersionHistoryDialog';
import { ShareDialog } from '@/components/editor/ShareDialog';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { exportAsText, exportAsDocx, generateExportFilename } from '@/utils/exportUtils';

const CURSOR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

export default function EditorPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState<DocumentContent | null>(null);
  const [currentContent, setCurrentContent] = useState<EditorContent | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [userColor] = useState(() => CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const presenceIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pollIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const editCountRef = useRef(0);
  const lastVersionRef = useRef(1);

  const loadDocument = useCallback(async () => {
    if (!documentId) return;
    const doc = await getDocument(documentId);
    if (doc) {
      setDocument(doc);
      setTitle(doc.title);
    } else {
      toast({
        title: 'Error',
        description: 'Document not found',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
    setLoading(false);
  }, [documentId, navigate, toast]);

  const loadContent = useCallback(async () => {
    if (!documentId) return;
    const docContent = await getDocumentContent(documentId);
    if (docContent) {
      setContent(docContent);
    }
  }, [documentId]);

  const loadCollaborators = useCallback(async () => {
    if (!documentId) return;
    const collabs = await getCollaborators(documentId);
    setCollaborators(collabs);
  }, [documentId]);

  const loadComments = useCallback(async () => {
    if (!documentId) return;
    const cmts = await getComments(documentId);
    setComments(cmts);
  }, [documentId]);

  const loadActiveUsers = useCallback(async () => {
    if (!documentId) return;
    const users = await getActiveUsers(documentId);
    setActiveUsers(users);
  }, [documentId]);

  const loadVersions = useCallback(async () => {
    if (!documentId) return;
    const vers = await getDocumentVersions(documentId);
    setVersions(vers);
    if (vers.length > 0) {
      lastVersionRef.current = vers[0].version;
    }
  }, [documentId]);

  useEffect(() => {
    if (!documentId || !user) return;
    loadDocument();
    loadCollaborators();
    loadComments();
    loadVersions();

    // Start presence tracking
    updatePresence(documentId, user.id, cursorPosition, userColor);
    presenceIntervalRef.current = setInterval(() => {
      if (documentId && user) {
        updatePresence(documentId, user.id, cursorPosition, userColor);
        loadActiveUsers();
      }
    }, 5000);

    // Start polling for updates
    pollIntervalRef.current = setInterval(() => {
      loadDocument();
      loadContent();
      loadCollaborators();
      loadComments();
      loadActiveUsers();
    }, 3000);

    return () => {
      if (documentId && user) {
        removePresence(documentId, user.id);
      }
      if (presenceIntervalRef.current) clearInterval(presenceIntervalRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [documentId, user, cursorPosition, userColor, loadDocument, loadContent, loadCollaborators, loadComments, loadActiveUsers, loadVersions]);

  const handleManualSave = useCallback(async () => {
    if (!documentId || !user || !currentContent) {
      toast({
        title: 'Error',
        description: 'No changes to save',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      await updateDocumentContent(documentId, currentContent, user.id);
      setHasUnsavedChanges(false);
      setSaving(false);

      toast({
        title: 'Saved',
        description: 'Document saved successfully',
      });
    } catch (error) {
      console.error('Save failed:', error);
      setSaving(false);
      toast({
        title: 'Save failed',
        description: 'Failed to save document. Please try again.',
        variant: 'destructive',
      });
    }
  }, [documentId, user, currentContent, toast]);

  // Keyboard shortcut for save (Ctrl+S or Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

  const handleContentChange = useCallback(
    (newContent: EditorContent) => {
      if (!documentId || !user) return;

      // Update current content and mark as unsaved
      setCurrentContent(newContent);
      setHasUnsavedChanges(true);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Auto-save after 2 seconds of inactivity
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          await updateDocumentContent(documentId, newContent, user.id);
          setHasUnsavedChanges(false);
          setSaving(false);

          // Create version snapshot every 10 edits
          editCountRef.current += 1;
          if (editCountRef.current >= 10) {
            editCountRef.current = 0;
            lastVersionRef.current += 1;
            await createDocumentVersion(documentId, newContent, lastVersionRef.current, user.id);
            loadVersions();
          }

          toast({
            title: 'Auto-saved',
            description: 'Your changes have been saved automatically',
          });
        } catch (error) {
          console.error('Auto-save failed:', error);
          setSaving(false);
          toast({
            title: 'Auto-save failed',
            description: 'Please save manually',
            variant: 'destructive',
          });
        }
      }, 2000);
    },
    [documentId, user, loadVersions, toast]
  );

  const handleTitleChange = async () => {
    if (!documentId || !title.trim()) return;
    await updateDocument(documentId, { title });
    toast({
      title: 'Success',
      description: 'Title updated',
    });
  };

  const handleCursorChange = useCallback(
    (position: number) => {
      setCursorPosition(position);
      if (documentId && user) {
        updatePresence(documentId, user.id, position, userColor);
      }
    },
    [documentId, user, userColor]
  );

  const handleExportText = async () => {
    if (!content?.content?.html) {
      toast({
        title: 'Error',
        description: 'No content to export',
        variant: 'destructive',
      });
      return;
    }

    try {
      const filename = generateExportFilename(title || 'Untitled');
      await exportAsText(content.content.html, filename);
      toast({
        title: 'Success',
        description: 'Document exported as text file',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export document',
        variant: 'destructive',
      });
    }
  };

  const handleExportDocx = async () => {
    if (!content?.content?.html) {
      toast({
        title: 'Error',
        description: 'No content to export',
        variant: 'destructive',
      });
      return;
    }

    try {
      const filename = generateExportFilename(title || 'Untitled');
      await exportAsDocx(content.content.html, filename);
      toast({
        title: 'Success',
        description: 'Document exported as Word document',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export document',
        variant: 'destructive',
      });
    }
  };

  const canEdit = document && user && (document.owner_id === user.id || 
    collaborators.some(c => c.user_id === user.id && (c.role === 'editor' || c.role === 'owner')));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!document || !content) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleChange}
              className="max-w-md font-semibold"
              placeholder="Untitled Document"
            />
            {saving && (
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            )}
            {!saving && hasUnsavedChanges && (
              <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                Unsaved changes
              </span>
            )}
            {!saving && !hasUnsavedChanges && currentContent && (
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                All changes saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <PresenceIndicator activeUsers={activeUsers} currentUserId={user?.id || ''} />
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant={hasUnsavedChanges ? 'default' : 'ghost'}
              size="sm"
              onClick={handleManualSave}
              disabled={saving || !hasUnsavedChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVersionHistory(true)}
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportText}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as Text (.txt)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportDocx}>
                  <FileType className="h-4 w-4 mr-2" />
                  Export as Word (.docx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant={showComments ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareDialog(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant={showCollaborators ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShowCollaborators(!showCollaborators)}
            >
              <Users className="h-4 w-4 mr-2" />
              Collaborators
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Editor */}
          <ResizablePanel defaultSize={showCollaborators || showComments ? 60 : 100} minSize={40}>
            <div className="h-full p-6 overflow-auto">
              <div className="max-w-4xl mx-auto">
                <RichTextEditor
                  content={content.content}
                  onChange={handleContentChange}
                  onCursorChange={handleCursorChange}
                  readOnly={!canEdit}
                />
              </div>
            </div>
          </ResizablePanel>

          {/* Collaborators Sidebar */}
          {showCollaborators && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <div className="h-full border-l border-border bg-card">
                  <CollaboratorsSidebar
                    documentId={documentId!}
                    ownerId={document.owner_id}
                    collaborators={collaborators}
                    currentUserId={user?.id || ''}
                    onUpdate={loadCollaborators}
                  />
                </div>
              </ResizablePanel>
            </>
          )}

          {/* Comments Panel */}
          {showComments && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <div className="h-full border-l border-border bg-card">
                  <CommentsPanel
                    documentId={documentId!}
                    comments={comments}
                    currentUserId={user?.id || ''}
                    onUpdate={loadComments}
                  />
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Version History Dialog */}
      <VersionHistoryDialog
        open={showVersionHistory}
        onOpenChange={setShowVersionHistory}
        documentId={documentId!}
        versions={versions}
        currentUserId={user?.id || ''}
        onRestore={() => {
          loadContent();
          loadVersions();
        }}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        documentId={documentId!}
        documentTitle={document.title}
        currentUserId={user?.id || ''}
      />
    </div>
  );
}
