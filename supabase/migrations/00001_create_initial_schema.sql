-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Create collaborator role enum
CREATE TYPE public.collaborator_role AS ENUM ('owner', 'editor', 'viewer');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  email TEXT,
  role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_edited_by UUID REFERENCES public.profiles(id),
  last_edited_at TIMESTAMPTZ
);

-- Create document_content table
CREATE TABLE public.document_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  content JSONB DEFAULT '{}'::jsonb NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(document_id)
);

-- Create collaborators table
CREATE TABLE public.collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.collaborator_role NOT NULL DEFAULT 'viewer'::public.collaborator_role,
  invited_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(document_id, user_id)
);

-- Create document_versions table
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version INTEGER NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position_start INTEGER,
  position_end INTEGER,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  resolved BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create active_users table for presence tracking
CREATE TABLE public.active_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cursor_position INTEGER,
  cursor_color TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(document_id, user_id)
);

-- Create indexes
CREATE INDEX idx_documents_owner ON public.documents(owner_id);
CREATE INDEX idx_documents_updated ON public.documents(updated_at DESC);
CREATE INDEX idx_collaborators_document ON public.collaborators(document_id);
CREATE INDEX idx_collaborators_user ON public.collaborators(user_id);
CREATE INDEX idx_comments_document ON public.comments(document_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);
CREATE INDEX idx_active_users_document ON public.active_users(document_id);
CREATE INDEX idx_document_versions_document ON public.document_versions(document_id, version DESC);

-- Create helper function for admin check
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Create helper function to check document access
CREATE OR REPLACE FUNCTION has_document_access(doc_id uuid, uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = doc_id AND d.owner_id = uid
  ) OR EXISTS (
    SELECT 1 FROM collaborators c
    WHERE c.document_id = doc_id AND c.user_id = uid
  );
$$;

-- Create helper function to check if user can edit document
CREATE OR REPLACE FUNCTION can_edit_document(doc_id uuid, uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = doc_id AND d.owner_id = uid
  ) OR EXISTS (
    SELECT 1 FROM collaborators c
    WHERE c.document_id = doc_id 
      AND c.user_id = uid 
      AND c.role IN ('owner'::collaborator_role, 'editor'::collaborator_role)
  );
$$;

-- Create trigger function for user sync
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  INSERT INTO public.profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1),
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END
  );
  RETURN NEW;
END;
$$;

-- Create trigger for auth user sync
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_users ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Anyone can view public profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

-- Documents policies
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Users can view documents they collaborate on" ON documents
  FOR SELECT TO authenticated USING (has_document_access(id, auth.uid()));

CREATE POLICY "Users can create documents" ON documents
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their documents" ON documents
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their documents" ON documents
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Document content policies
CREATE POLICY "Users can view content of accessible documents" ON document_content
  FOR SELECT TO authenticated USING (has_document_access(document_id, auth.uid()));

CREATE POLICY "Users can insert content for their documents" ON document_content
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = auth.uid())
  );

CREATE POLICY "Editors can update document content" ON document_content
  FOR UPDATE TO authenticated USING (can_edit_document(document_id, auth.uid()));

-- Collaborators policies
CREATE POLICY "Users can view collaborators of accessible documents" ON collaborators
  FOR SELECT TO authenticated USING (has_document_access(document_id, auth.uid()));

CREATE POLICY "Owners can manage collaborators" ON collaborators
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = auth.uid())
  );

-- Document versions policies
CREATE POLICY "Users can view versions of accessible documents" ON document_versions
  FOR SELECT TO authenticated USING (has_document_access(document_id, auth.uid()));

CREATE POLICY "System can create versions" ON document_versions
  FOR INSERT TO authenticated WITH CHECK (can_edit_document(document_id, auth.uid()));

-- Comments policies
CREATE POLICY "Users can view comments on accessible documents" ON comments
  FOR SELECT TO authenticated USING (has_document_access(document_id, auth.uid()));

CREATE POLICY "Users can create comments on accessible documents" ON comments
  FOR INSERT TO authenticated WITH CHECK (
    has_document_access(document_id, auth.uid()) AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Active users policies
CREATE POLICY "Users can view active users on accessible documents" ON active_users
  FOR SELECT TO authenticated USING (has_document_access(document_id, auth.uid()));

CREATE POLICY "Users can update their own presence" ON active_users
  FOR ALL TO authenticated USING (user_id = auth.uid());