export type UserRole = 'user' | 'admin';
export type CollaboratorRole = 'owner' | 'editor' | 'viewer';
export type SubscriptionTier = 'free' | 'premium';

export interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  last_edited_by: string | null;
  last_edited_at: string | null;
  owner?: Profile;
}

export interface DocumentContent {
  id: string;
  document_id: string;
  content: EditorContent;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface EditorContent {
  html?: string;
  text?: string;
  ops?: Array<{
    insert: string;
    attributes?: {
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      header?: number;
      list?: 'bullet' | 'ordered';
      'code-block'?: boolean;
      font?: string;
      size?: string;
      color?: string;
      align?: 'left' | 'center' | 'right' | 'justify';
    };
  }>;
}

export interface Collaborator {
  id: string;
  document_id: string;
  user_id: string;
  role: CollaboratorRole;
  invited_by: string | null;
  created_at: string;
  user?: Profile;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  content: EditorContent;
  version: number;
  created_by: string | null;
  created_at: string;
  creator?: Profile;
}

export interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  position_start: number | null;
  position_end: number | null;
  parent_id: string | null;
  resolved: boolean;
  created_at: string;
  updated_at: string;
  user?: Profile;
  replies?: Comment[];
}

export interface ActiveUser {
  id: string;
  document_id: string;
  user_id: string;
  cursor_position: number | null;
  cursor_color: string | null;
  last_seen: string;
  user?: Profile;
}

export interface DocumentWithAccess extends Document {
  access_role: CollaboratorRole | 'owner';
  collaborators_count?: number;
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export interface DocumentInvitation {
  id: string;
  document_id: string;
  token: string;
  role: CollaboratorRole;
  created_by: string;
  status: InvitationStatus;
  accepted_by: string | null;
  created_at: string;
  expires_at: string | null;
  max_uses: number | null;
  use_count: number;
  document?: Document;
  creator?: Profile;
}

// Code Collaboration Types
export interface CodeDocument {
  id: string;
  title: string;
  language: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface CodeContent {
  id: string;
  code_document_id: string;
  content: string;
  updated_by: string | null;
  updated_at: string;
}

export interface CodeCollaborator {
  id: string;
  code_document_id: string;
  user_id: string;
  role: CollaboratorRole;
  created_at: string;
  user?: Profile;
}

export interface CodeComment {
  id: string;
  code_document_id: string;
  user_id: string;
  content: string;
  line_number: number | null;
  resolved: boolean;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface CodeVersion {
  id: string;
  code_document_id: string;
  content: string;
  version_number: number;
  created_by: string | null;
  created_at: string;
  creator?: Profile;
}

export interface CodeActiveUser {
  id: string;
  code_document_id: string;
  user_id: string;
  cursor_position: number;
  color: string;
  last_seen: string;
  user?: Profile;
}

export interface CodeDocumentWithAccess extends CodeDocument {
  access_role: CollaboratorRole | 'owner';
  collaborators_count?: number;
}

// Content Library Types
export type ContentCategory = 'blog' | 'topic' | 'paragraph' | 'text' | 'code' | 'quote' | 'link';

export interface ContentSnippet {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: ContentCategory;
  tags: string[];
  created_at: string;
  updated_at: string;
}

