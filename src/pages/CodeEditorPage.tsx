import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCodeDocument,
  getCodeContent,
  updateCodeContent,
  updateCodeDocument,
  getCodeCollaborators,
  getCodeComments,
  getCodeActiveUsers,
  getCodeVersions,
  updateCodePresence,
  removeCodePresence,
  createCodeVersion,
} from '@/db/api';
import type {
  CodeDocument,
  CodeContent,
  CodeCollaborator,
  CodeComment,
  CodeActiveUser,
  CodeVersion,
} from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Save,
  Loader2,
  Users,
  MessageSquare,
  History,
  Share2,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { PresenceIndicator } from '@/components/editor/PresenceIndicator';

const CURSOR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

export default function CodeEditorPage() {
  const { codeDocumentId } = useParams<{ codeDocumentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [codeDocument, setCodeDocument] = useState<CodeDocument | null>(null);
  const [content, setContent] = useState<CodeContent | null>(null);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [collaborators, setCollaborators] = useState<CodeCollaborator[]>([]);
  const [comments, setComments] = useState<CodeComment[]>([]);
  const [activeUsers, setActiveUsers] = useState<CodeActiveUser[]>([]);
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [userColor] = useState(() => CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const presenceIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pollIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const editCountRef = useRef(0);
  const lastVersionRef = useRef(0);
  const editorRef = useRef<any>(null);

  // Detect theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const loadCodeDocument = useCallback(async () => {
    if (!codeDocumentId) return;
    const doc = await getCodeDocument(codeDocumentId);
    if (doc) {
      setCodeDocument(doc);
      setTitle(doc.title);
    }
  }, [codeDocumentId]);

  const loadContent = useCallback(async () => {
    if (!codeDocumentId) return;
    const contentData = await getCodeContent(codeDocumentId);
    if (contentData) {
      setContent(contentData);
      if (!currentContent) {
        setCurrentContent(contentData.content);
      }
    }
  }, [codeDocumentId, currentContent]);

  const loadCollaborators = useCallback(async () => {
    if (!codeDocumentId) return;
    const collabs = await getCodeCollaborators(codeDocumentId);
    setCollaborators(collabs);
  }, [codeDocumentId]);

  const loadComments = useCallback(async () => {
    if (!codeDocumentId) return;
    const commentsData = await getCodeComments(codeDocumentId);
    setComments(commentsData);
  }, [codeDocumentId]);

  const loadActiveUsers = useCallback(async () => {
    if (!codeDocumentId) return;
    const users = await getCodeActiveUsers(codeDocumentId);
    setActiveUsers(users);
  }, [codeDocumentId]);

  const loadVersions = useCallback(async () => {
    if (!codeDocumentId) return;
    const versionsData = await getCodeVersions(codeDocumentId);
    setVersions(versionsData);
    if (versionsData.length > 0) {
      lastVersionRef.current = versionsData[0].version_number;
    }
  }, [codeDocumentId]);

  useEffect(() => {
    if (!codeDocumentId || !user) {
      navigate('/codes');
      return;
    }
    setLoading(true);
    loadCodeDocument().then(() => setLoading(false));
  }, [codeDocumentId, user, navigate, loadCodeDocument]);

  useEffect(() => {
    if (!codeDocumentId || !user) return;
    loadCodeDocument();
    loadCollaborators();
    loadComments();
    loadVersions();

    // Start presence tracking
    updateCodePresence(codeDocumentId, user.id, cursorPosition, userColor);
    presenceIntervalRef.current = setInterval(() => {
      if (codeDocumentId && user) {
        updateCodePresence(codeDocumentId, user.id, cursorPosition, userColor);
        loadActiveUsers();
      }
    }, 5000);

    // Start polling for updates
    pollIntervalRef.current = setInterval(() => {
      loadCodeDocument();
      loadContent();
      loadCollaborators();
      loadComments();
      loadActiveUsers();
    }, 3000);

    return () => {
      if (codeDocumentId && user) {
        removeCodePresence(codeDocumentId, user.id);
      }
      if (presenceIntervalRef.current) clearInterval(presenceIntervalRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [codeDocumentId, user, cursorPosition, userColor, loadCodeDocument, loadContent, loadCollaborators, loadComments, loadActiveUsers, loadVersions]);

  const handleManualSave = useCallback(async () => {
    if (!codeDocumentId || !user || !currentContent) {
      toast({
        title: 'Error',
        description: 'No changes to save',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      await updateCodeContent(codeDocumentId, currentContent, user.id);
      setHasUnsavedChanges(false);
      setSaving(false);

      toast({
        title: 'Saved',
        description: 'Code saved successfully',
      });
    } catch (error) {
      console.error('Save failed:', error);
      setSaving(false);
      toast({
        title: 'Save failed',
        description: 'Failed to save code. Please try again.',
        variant: 'destructive',
      });
    }
  }, [codeDocumentId, user, currentContent, toast]);

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
    (value: string | undefined) => {
      if (!codeDocumentId || !user || value === undefined) return;

      // Update current content and mark as unsaved
      setCurrentContent(value);
      setHasUnsavedChanges(true);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Auto-save after 2 seconds of inactivity
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          await updateCodeContent(codeDocumentId, value, user.id);
          setHasUnsavedChanges(false);
          setSaving(false);

          // Create version snapshot every 10 edits
          editCountRef.current += 1;
          if (editCountRef.current >= 10) {
            editCountRef.current = 0;
            lastVersionRef.current += 1;
            await createCodeVersion(codeDocumentId, value, lastVersionRef.current, user.id);
            loadVersions();
          }

          toast({
            title: 'Auto-saved',
            description: 'Your code has been saved automatically',
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
    [codeDocumentId, user, loadVersions, toast]
  );

  const handleTitleChange = async () => {
    if (!codeDocumentId || !title.trim()) return;
    await updateCodeDocument(codeDocumentId, { title });
    toast({
      title: 'Success',
      description: 'Title updated',
    });
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Track cursor position
    editor.onDidChangeCursorPosition((e: any) => {
      const position = e.position;
      const offset = editor.getModel()?.getOffsetAt(position) || 0;
      setCursorPosition(offset);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!codeDocument) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Code document not found</h2>
          <Button onClick={() => navigate('/codes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Codes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => navigate('/codes')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleChange}
              className="max-w-md font-semibold"
              placeholder="Untitled Code"
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
            <PresenceIndicator 
              activeUsers={activeUsers.map(u => ({
                ...u,
                document_id: u.code_document_id,
                cursor_color: u.color,
              }) as any)} 
              currentUserId={user?.id || ''} 
            />
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
            <Button variant="ghost" size="sm">
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Collaborators
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={codeDocument.language}
          value={currentContent}
          onChange={handleContentChange}
          onMount={handleEditorDidMount}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', 'Monaco', monospace",
            fontLigatures: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
          }}
        />
      </div>
    </div>
  );
}
