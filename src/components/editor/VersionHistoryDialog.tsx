import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clock, RotateCcw } from 'lucide-react';
import type { DocumentVersion, EditorContent } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { restoreDocumentVersion } from '@/db/api';
import { RichTextEditor } from './RichTextEditor';

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  versions: DocumentVersion[];
  currentUserId: string;
  onRestore: () => void;
}

export function VersionHistoryDialog({
  open,
  onOpenChange,
  documentId,
  versions,
  currentUserId,
  onRestore,
}: VersionHistoryDialogProps) {
  const { toast } = useToast();
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [restoring, setRestoring] = useState(false);

  const handleRestore = async () => {
    if (!selectedVersion) return;

    setRestoring(true);
    const success = await restoreDocumentVersion(documentId, selectedVersion.content, currentUserId);
    setRestoring(false);

    if (success) {
      toast({
        title: 'Success',
        description: 'Version restored successfully',
      });
      onRestore();
      onOpenChange(false);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to restore version',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>View and restore previous versions of this document</DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Version List */}
          <div className="w-64 border-r border-border">
            <ScrollArea className="h-full">
              <div className="pr-4 space-y-2">
                {versions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No versions yet</p>
                  </div>
                ) : (
                  versions.map((version) => (
                    <button
                      key={version.id}
                      onClick={() => setSelectedVersion(version)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedVersion?.id === version.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          v{version.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(version.created_at)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {version.creator?.username || 'Unknown'}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Version Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedVersion ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Version {selectedVersion.version}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedVersion.created_at)} by{' '}
                      {selectedVersion.creator?.username || 'Unknown'}
                    </p>
                  </div>
                  <Button onClick={handleRestore} disabled={restoring}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {restoring ? 'Restoring...' : 'Restore'}
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <RichTextEditor
                    content={selectedVersion.content}
                    onChange={() => {}}
                    readOnly
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a version to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
