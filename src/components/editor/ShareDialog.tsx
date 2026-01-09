import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Link2, Copy, Trash2, Check, Clock, Users as UsersIcon } from 'lucide-react';
import type { CollaboratorRole, DocumentInvitation } from '@/types/types';
import { createInvitation, getDocumentInvitations, deleteInvitation } from '@/db/api';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
  currentUserId: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  currentUserId,
}: ShareDialogProps) {
  const { toast } = useToast();
  const [role, setRole] = useState<CollaboratorRole>('viewer');
  const [expiresInDays, setExpiresInDays] = useState<string>('7');
  const [maxUses, setMaxUses] = useState<string>('');
  const [invitations, setInvitations] = useState<DocumentInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadInvitations();
    }
  }, [open, documentId]);

  const loadInvitations = async () => {
    const invites = await getDocumentInvitations(documentId);
    setInvitations(invites.filter(inv => inv.status === 'pending'));
  };

  const handleCreateLink = async () => {
    setLoading(true);
    const expires = expiresInDays ? parseInt(expiresInDays) : undefined;
    const max = maxUses ? parseInt(maxUses) : undefined;

    const invitation = await createInvitation(documentId, role, currentUserId, expires, max);
    setLoading(false);

    if (invitation) {
      toast({
        title: 'Success',
        description: 'Invitation link created',
      });
      loadInvitations();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create invitation link',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    toast({
      title: 'Copied',
      description: 'Invitation link copied to clipboard',
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    const success = await deleteInvitation(invitationId);
    if (success) {
      toast({
        title: 'Success',
        description: 'Invitation link deleted',
      });
      loadInvitations();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete invitation',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleBadgeVariant = (role: CollaboratorRole) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'editor':
        return 'secondary';
      case 'viewer':
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share "{documentTitle}"</DialogTitle>
          <DialogDescription>
            Create a shareable link that others can use to access this document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Link */}
          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
            <h3 className="font-semibold flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Create New Invitation Link
            </h3>

            <div className="grid gap-4 xl:grid-cols-3">
              <div className="space-y-2">
                <Label>Access Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as CollaboratorRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor - Can edit</SelectItem>
                    <SelectItem value="viewer">Viewer - Read only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Expires In (days)</Label>
                <Input
                  type="number"
                  placeholder="7"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  min="1"
                  max="365"
                />
              </div>

              <div className="space-y-2">
                <Label>Max Uses (optional)</Label>
                <Input
                  type="number"
                  placeholder="Unlimited"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            <Button onClick={handleCreateLink} disabled={loading} className="w-full">
              <Link2 className="mr-2 h-4 w-4" />
              {loading ? 'Creating...' : 'Generate Invitation Link'}
            </Button>
          </div>

          {/* Active Invitations */}
          <div className="space-y-3">
            <h3 className="font-semibold">Active Invitation Links</h3>
            <ScrollArea className="h-[300px] pr-4">
              {invitations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Link2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active invitation links</p>
                  <p className="text-xs mt-1">Create one to share this document</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.map((invitation) => {
                    const url = `${window.location.origin}/invite/${invitation.token}`;
                    const isExpired = invitation.expires_at && new Date(invitation.expires_at) < new Date();
                    const maxUsesReached = invitation.max_uses && invitation.use_count >= invitation.max_uses;

                    return (
                      <div
                        key={invitation.id}
                        className="p-3 border border-border rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={getRoleBadgeVariant(invitation.role)}>
                                {invitation.role}
                              </Badge>
                              {isExpired && (
                                <Badge variant="destructive" className="text-xs">
                                  Expired
                                </Badge>
                              )}
                              {maxUsesReached && (
                                <Badge variant="destructive" className="text-xs">
                                  Max uses reached
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {invitation.expires_at && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Expires {formatDate(invitation.expires_at)}
                                </span>
                              )}
                              {invitation.max_uses && (
                                <span className="flex items-center gap-1">
                                  <UsersIcon className="h-3 w-3" />
                                  {invitation.use_count}/{invitation.max_uses} uses
                                </span>
                              )}
                              {!invitation.max_uses && invitation.use_count > 0 && (
                                <span className="flex items-center gap-1">
                                  <UsersIcon className="h-3 w-3" />
                                  {invitation.use_count} uses
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteInvitation(invitation.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="flex gap-2">
                          <Input
                            value={url}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopyLink(invitation.token)}
                          >
                            {copiedToken === invitation.token ? (
                              <Check className="h-4 w-4 text-success" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
