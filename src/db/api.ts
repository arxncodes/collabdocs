import { supabase } from './supabase';
import type {
  Profile,
  Document,
  DocumentContent,
  Collaborator,
  DocumentVersion,
  Comment,
  ActiveUser,
  CollaboratorRole,
  EditorContent,
  DocumentWithAccess,
  DocumentInvitation,
} from '@/types/types';

// ============ Profiles ============
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  return data;
}

export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    return false;
  }
  return true;
}

// ============ Documents ============
export async function getMyDocuments(userId: string): Promise<DocumentWithAccess[]> {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      owner:profiles!documents_owner_id_fkey(id, username, email, avatar_url),
      collaborators(count)
    `)
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching my documents:', error);
    return [];
  }

  if (!Array.isArray(data)) return [];

  return data.map(doc => ({
    ...doc,
    access_role: 'owner' as const,
    collaborators_count: Array.isArray(doc.collaborators) && doc.collaborators.length > 0 
      ? (doc.collaborators[0] as any).count || 0 
      : 0,
  }));
}

export async function getSharedDocuments(userId: string): Promise<DocumentWithAccess[]> {
  const { data, error } = await supabase
    .from('collaborators')
    .select(`
      role,
      document:documents!collaborators_document_id_fkey(
        *,
        owner:profiles!documents_owner_id_fkey(id, username, email, avatar_url),
        collaborators(count)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shared documents:', error);
    return [];
  }

  if (!Array.isArray(data)) return [];

  const results: DocumentWithAccess[] = [];
  
  for (const item of data) {
    if (!item.document) continue;
    
    const doc = item.document as any;
    const collabCount = Array.isArray(doc.collaborators) && doc.collaborators.length > 0
      ? (doc.collaborators[0].count || 0)
      : 0;
    
    results.push({
      id: doc.id,
      title: doc.title,
      owner_id: doc.owner_id,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      last_edited_by: doc.last_edited_by,
      last_edited_at: doc.last_edited_at,
      owner: doc.owner,
      access_role: item.role,
      collaborators_count: collabCount,
    });
  }
  
  return results;
}

export async function getDocument(documentId: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      owner:profiles!documents_owner_id_fkey(id, username, email, avatar_url)
    `)
    .eq('id', documentId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching document:', error);
    return null;
  }
  return data;
}

export async function createDocument(title: string, ownerId: string): Promise<Document | null> {
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert({
      title: title || 'Untitled Document',
      owner_id: ownerId,
    })
    .select()
    .maybeSingle();

  if (docError || !doc) {
    console.error('Error creating document:', docError);
    return null;
  }

  // Create initial content
  const { error: contentError } = await supabase
    .from('document_content')
    .insert({
      document_id: doc.id,
      content: { ops: [{ insert: '\n' }] },
      version: 1,
    });

  if (contentError) {
    console.error('Error creating document content:', contentError);
  }

  return doc;
}

export async function updateDocument(documentId: string, updates: Partial<Document>): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', documentId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating document:', error);
    return null;
  }
  return data;
}

export async function deleteDocument(documentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (error) {
    console.error('Error deleting document:', error);
    return false;
  }
  return true;
}

// ============ Document Content ============
export async function getDocumentContent(documentId: string): Promise<DocumentContent | null> {
  const { data, error } = await supabase
    .from('document_content')
    .select('*')
    .eq('document_id', documentId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching document content:', error);
    return null;
  }
  return data;
}

export async function updateDocumentContent(
  documentId: string,
  content: EditorContent,
  userId: string
): Promise<DocumentContent | null> {
  // Update content
  const { data, error } = await supabase
    .from('document_content')
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('document_id', documentId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating document content:', error);
    return null;
  }

  // Update document's last_edited info
  await supabase
    .from('documents')
    .update({
      last_edited_by: userId,
      last_edited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId);

  return data;
}

// ============ Collaborators ============
export async function getCollaborators(documentId: string): Promise<Collaborator[]> {
  const { data, error } = await supabase
    .from('collaborators')
    .select(`
      *,
      user:profiles!collaborators_user_id_fkey(id, username, email, avatar_url)
    `)
    .eq('document_id', documentId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching collaborators:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function addCollaborator(
  documentId: string,
  userId: string,
  role: CollaboratorRole,
  invitedBy: string
): Promise<Collaborator | null> {
  const { data, error } = await supabase
    .from('collaborators')
    .insert({
      document_id: documentId,
      user_id: userId,
      role,
      invited_by: invitedBy,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error adding collaborator:', error);
    return null;
  }
  return data;
}

export async function updateCollaboratorRole(
  collaboratorId: string,
  role: CollaboratorRole
): Promise<boolean> {
  const { error } = await supabase
    .from('collaborators')
    .update({ role })
    .eq('id', collaboratorId);

  if (error) {
    console.error('Error updating collaborator role:', error);
    return false;
  }
  return true;
}

export async function removeCollaborator(collaboratorId: string): Promise<boolean> {
  const { error } = await supabase
    .from('collaborators')
    .delete()
    .eq('id', collaboratorId);

  if (error) {
    console.error('Error removing collaborator:', error);
    return false;
  }
  return true;
}

// ============ Document Versions ============
export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const { data, error } = await supabase
    .from('document_versions')
    .select(`
      *,
      creator:profiles!document_versions_created_by_fkey(id, username, email, avatar_url)
    `)
    .eq('document_id', documentId)
    .order('version', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching document versions:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function createDocumentVersion(
  documentId: string,
  content: EditorContent,
  version: number,
  createdBy: string
): Promise<DocumentVersion | null> {
  const { data, error } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      content,
      version,
      created_by: createdBy,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating document version:', error);
    return null;
  }
  return data;
}

export async function restoreDocumentVersion(
  documentId: string,
  versionContent: EditorContent,
  userId: string
): Promise<boolean> {
  const result = await updateDocumentContent(documentId, versionContent, userId);
  return result !== null;
}

// ============ Comments ============
export async function getComments(documentId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles!comments_user_id_fkey(id, username, email, avatar_url)
    `)
    .eq('document_id', documentId)
    .is('parent_id', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  // Fetch replies for each comment
  const comments = Array.isArray(data) ? data : [];
  for (const comment of comments) {
    const { data: replies } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles!comments_user_id_fkey(id, username, email, avatar_url)
      `)
      .eq('parent_id', comment.id)
      .order('created_at', { ascending: true });

    comment.replies = Array.isArray(replies) ? replies : [];
  }

  return comments;
}

export async function createComment(
  documentId: string,
  userId: string,
  content: string,
  positionStart?: number,
  positionEnd?: number,
  parentId?: string
): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      document_id: documentId,
      user_id: userId,
      content,
      position_start: positionStart || null,
      position_end: positionEnd || null,
      parent_id: parentId || null,
    })
    .select(`
      *,
      user:profiles!comments_user_id_fkey(id, username, email, avatar_url)
    `)
    .maybeSingle();

  if (error) {
    console.error('Error creating comment:', error);
    return null;
  }
  return data;
}

export async function updateComment(commentId: string, content: string): Promise<boolean> {
  const { error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId);

  if (error) {
    console.error('Error updating comment:', error);
    return false;
  }
  return true;
}

export async function toggleCommentResolved(commentId: string, resolved: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('comments')
    .update({ resolved })
    .eq('id', commentId);

  if (error) {
    console.error('Error toggling comment resolved:', error);
    return false;
  }
  return true;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
  return true;
}

// ============ Active Users (Presence) ============
export async function getActiveUsers(documentId: string): Promise<ActiveUser[]> {
  // Get users active in the last 30 seconds
  const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
  
  const { data, error } = await supabase
    .from('active_users')
    .select(`
      *,
      user:profiles!active_users_user_id_fkey(id, username, email, avatar_url)
    `)
    .eq('document_id', documentId)
    .gte('last_seen', thirtySecondsAgo);

  if (error) {
    console.error('Error fetching active users:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function updatePresence(
  documentId: string,
  userId: string,
  cursorPosition?: number,
  cursorColor?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('active_users')
    .upsert({
      document_id: documentId,
      user_id: userId,
      cursor_position: cursorPosition || null,
      cursor_color: cursorColor || null,
      last_seen: new Date().toISOString(),
    }, {
      onConflict: 'document_id,user_id',
    });

  if (error) {
    console.error('Error updating presence:', error);
    return false;
  }
  return true;
}

export async function removePresence(documentId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('active_users')
    .delete()
    .eq('document_id', documentId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing presence:', error);
    return false;
  }
  return true;
}

// ============ Document Invitations ============
export async function createInvitation(
  documentId: string,
  role: CollaboratorRole,
  createdBy: string,
  expiresInDays?: number,
  maxUses?: number
): Promise<DocumentInvitation | null> {
  const token = crypto.randomUUID();
  const expiresAt = expiresInDays 
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { data, error } = await supabase
    .from('document_invitations')
    .insert({
      document_id: documentId,
      token,
      role,
      created_by: createdBy,
      expires_at: expiresAt,
      max_uses: maxUses || null,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating invitation:', error);
    return null;
  }
  return data;
}

export async function getInvitationByToken(token: string): Promise<DocumentInvitation | null> {
  const { data, error } = await supabase
    .from('document_invitations')
    .select(`
      *,
      document:documents!document_invitations_document_id_fkey(
        *,
        owner:profiles!documents_owner_id_fkey(id, username, email, avatar_url)
      ),
      creator:profiles!document_invitations_created_by_fkey(id, username, email, avatar_url)
    `)
    .eq('token', token)
    .maybeSingle();

  if (error) {
    console.error('Error fetching invitation:', error);
    return null;
  }
  return data;
}

export async function getDocumentInvitations(documentId: string): Promise<DocumentInvitation[]> {
  const { data, error } = await supabase
    .from('document_invitations')
    .select(`
      *,
      creator:profiles!document_invitations_created_by_fkey(id, username, email, avatar_url)
    `)
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invitations:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function acceptInvitation(
  invitationId: string,
  token: string,
  userId: string
): Promise<{ success: boolean; collaborator?: Collaborator }> {
  // Get invitation details
  const invitation = await getInvitationByToken(token);
  
  if (!invitation) {
    return { success: false };
  }

  // Check if expired
  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return { success: false };
  }

  // Check if max uses reached
  if (invitation.max_uses && invitation.use_count >= invitation.max_uses) {
    return { success: false };
  }

  // Check if user is already a collaborator
  const { data: existing } = await supabase
    .from('collaborators')
    .select('id')
    .eq('document_id', invitation.document_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return { success: false };
  }

  // Add as collaborator
  const collaborator = await addCollaborator(
    invitation.document_id,
    userId,
    invitation.role,
    invitation.created_by
  );

  if (!collaborator) {
    return { success: false };
  }

  // Update invitation
  await supabase
    .from('document_invitations')
    .update({
      status: 'accepted',
      accepted_by: userId,
      use_count: invitation.use_count + 1,
    })
    .eq('id', invitationId);

  return { success: true, collaborator };
}

export async function declineInvitation(invitationId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('document_invitations')
    .update({
      status: 'declined',
      accepted_by: userId,
    })
    .eq('id', invitationId);

  if (error) {
    console.error('Error declining invitation:', error);
    return false;
  }
  return true;
}

export async function deleteInvitation(invitationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('document_invitations')
    .delete()
    .eq('id', invitationId);

  if (error) {
    console.error('Error deleting invitation:', error);
    return false;
  }
  return true;
}
