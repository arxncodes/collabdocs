import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserPlus, X, Crown, Edit, Eye } from 'lucide-react';
import type { Collaborator, Profile, CollaboratorRole } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import {
  addCollaborator,
  updateCollaboratorRole,
  removeCollaborator,
  getAllProfiles,
} from '@/db/api';

interface CollaboratorsSidebarProps {
  documentId: string;
  ownerId: string;
  collaborators: Collaborator[];
  currentUserId: string;
  onUpdate: () => void;
}

export function CollaboratorsSidebar({
  documentId,
  ownerId,
  collaborators,
  currentUserId,
  onUpdate,
}: CollaboratorsSidebarProps) {
  const { toast } = useToast();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<CollaboratorRole>('viewer');
  const [loading, setLoading] = useState(false);

  const isOwner = currentUserId === ownerId;

  const handleOpenInviteDialog = async () => {
    setLoading(true);
    const users = await getAllProfiles();
    // Filter out users who are already collaborators or the owner
    const existingUserIds = new Set([
      ownerId,
      ...collaborators.map((c) => c.user_id),
    ]);
    setAllUsers(users.filter((u) => !existingUserIds.has(u.id)));
    setLoading(false);
    setInviteDialogOpen(true);
  };

  const handleInvite = async () => {
    if (!selectedUserId) {
      toast({
        title: 'Error',
        description: 'Please select a user',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const result = await addCollaborator(documentId, selectedUserId, selectedRole, currentUserId);
    setLoading(false);

    if (result) {
      toast({
        title: 'Success',
        description: 'Collaborator added successfully',
      });
      setInviteDialogOpen(false);
      setSelectedUserId('');
      setSelectedRole('viewer');
      onUpdate();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to add collaborator',
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (collaboratorId: string, newRole: CollaboratorRole) => {
    const success = await updateCollaboratorRole(collaboratorId, newRole);
    if (success) {
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
      onUpdate();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    const success = await removeCollaborator(collaboratorId);
    if (success) {
      toast({
        title: 'Success',
        description: 'Collaborator removed successfully',
      });
      onUpdate();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to remove collaborator',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: CollaboratorRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3" />;
      case 'editor':
        return <Edit className="h-3 w-3" />;
      case 'viewer':
        return <Eye className="h-3 w-3" />;
    }
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
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Collaborators</h3>
          {isOwner && (
            <Button size="sm" onClick={handleOpenInviteDialog}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {collaborators.map((collab) => (
            <div
              key={collab.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {collab.user?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {collab.user?.username || collab.user?.email}
                  </p>
                  {isOwner ? (
                    <Select
                      value={collab.role}
                      onValueChange={(value) => handleRoleChange(collab.id, value as CollaboratorRole)}
                    >
                      <SelectTrigger className="h-6 text-xs w-24 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getRoleBadgeVariant(collab.role)} className="mt-1 text-xs">
                      {getRoleIcon(collab.role)}
                      <span className="ml-1">{collab.role}</span>
                    </Badge>
                  )}
                </div>
              </div>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemove(collab.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Collaborator</DialogTitle>
            <DialogDescription>Add someone to collaborate on this document</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as CollaboratorRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor - Can edit the document</SelectItem>
                  <SelectItem value="viewer">Viewer - Can only view</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={loading || !selectedUserId}>
              {loading ? 'Inviting...' : 'Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
