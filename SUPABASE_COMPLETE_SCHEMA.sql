-- ===================================================
-- COMPLETE SUPABASE SCHEMA FOR COLLABDOCS
-- Run this entire script to set up all tables and policies
-- ===================================================

-- ===================================================
-- 1. CREATE ENUMS
-- ===================================================

CREATE TYPE public.user_role AS ENUM ('user', 'admin');
CREATE TYPE public.collaborator_role AS ENUM ('owner', 'editor', 'viewer');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined');

-- ===================================================
-- 2. CREATE PROFILES TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  email TEXT,
  role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ===================================================
-- 3. CREATE DOCUMENTS TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_edited_by UUID REFERENCES public.profiles(id),
  last_edited_at TIMESTAMPTZ
);

-- ===================================================
-- 4. CREATE DOCUMENT_CONTENT TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.document_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  content JSONB DEFAULT '{}'::jsonb NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(document_id)
);

-- ===================================================
-- 5. CREATE COLLABORATORS TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.collaborator_role NOT NULL DEFAULT 'viewer'::public.collaborator_role,
  invited_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(document_id, user_id)
);

-- ===================================================
-- 6. CREATE DOCUMENT_VERSIONS TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version INTEGER NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ===================================================
-- 7. CREATE COMMENTS TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.comments (
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

-- ===================================================
-- 8. CREATE ACTIVE_USERS TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.active_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cursor_position INTEGER,
  cursor_color TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(document_id, user_id)
);

-- ===================================================
-- 9. CREATE DOCUMENT_INVITATIONS TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.document_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  role public.collaborator_role NOT NULL DEFAULT 'viewer'::public.collaborator_role,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.invitation_status DEFAULT 'pending'::public.invitation_status NOT NULL,
  accepted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER DEFAULT NULL,
  use_count INTEGER DEFAULT 0 NOT NULL
);

-- ===================================================
-- 10. CREATE CODE_DOCUMENTS TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.code_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'javascript',
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================
-- 11. CREATE CODE_CONTENT TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.code_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_document_id UUID NOT NULL REFERENCES public.code_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================
-- 12. CREATE CODE_COLLABORATORS TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.code_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_document_id UUID NOT NULL REFERENCES public.code_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(code_document_id, user_id)
);

-- ===================================================
-- 13. CREATE CODE_COMMENTS TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.code_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_document_id UUID NOT NULL REFERENCES public.code_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  line_number INTEGER,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================
-- 14. CREATE CODE_VERSIONS TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.code_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_document_id UUID NOT NULL REFERENCES public.code_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================
-- 15. CREATE CODE_ACTIVE_USERS TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.code_active_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_document_id UUID NOT NULL REFERENCES public.code_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cursor_position INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(code_document_id, user_id)
);

-- ===================================================
-- 16. CREATE INDEXES
-- ===================================================

-- Document indexes
CREATE INDEX IF NOT EXISTS idx_documents_owner ON public.documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated ON public.documents(updated_at DESC);

-- Collaborators indexes
CREATE INDEX IF NOT EXISTS idx_collaborators_document ON public.collaborators(document_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user ON public.collaborators(user_id);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_document ON public.comments(document_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);

-- Active users indexes
CREATE INDEX IF NOT EXISTS idx_active_users_document ON public.active_users(document_id);

-- Document versions indexes
CREATE INDEX IF NOT EXISTS idx_document_versions_document ON public.document_versions(document_id, version DESC);

-- Invitations indexes
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.document_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_document ON public.document_invitations(document_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.document_invitations(status);

-- Code document indexes
CREATE INDEX IF NOT EXISTS idx_code_documents_owner ON public.code_documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_code_content_document ON public.code_content(code_document_id);
CREATE INDEX IF NOT EXISTS idx_code_collaborators_document ON public.code_collaborators(code_document_id);
CREATE INDEX IF NOT EXISTS idx_code_collaborators_user ON public.code_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_code_comments_document ON public.code_comments(code_document_id);
CREATE INDEX IF NOT EXISTS idx_code_versions_document ON public.code_versions(code_document_id);
CREATE INDEX IF NOT EXISTS idx_code_active_users_document ON public.code_active_users(code_document_id);

-- ===================================================
-- 17. CREATE HELPER FUNCTIONS
-- ===================================================

CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

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

-- ===================================================
-- 18. CREATE TRIGGER FUNCTION FOR USER SYNC
-- ===================================================

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

-- ===================================================
-- 19. CREATE TRIGGERS
-- ===================================================

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- ===================================================
-- 20. ENABLE ROW LEVEL SECURITY
-- ===================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_active_users ENABLE ROW LEVEL SECURITY;

-- ===================================================
-- 21. CREATE RLS POLICIES - PROFILES
-- ===================================================

DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Anyone can view public profiles" ON profiles;
CREATE POLICY "Anyone can view public profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

-- ===================================================
-- 22. CREATE RLS POLICIES - DOCUMENTS
-- ===================================================

DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can view documents they collaborate on" ON documents;
CREATE POLICY "Users can view documents they collaborate on" ON documents
  FOR SELECT TO authenticated USING (has_document_access(id, auth.uid()));

DROP POLICY IF EXISTS "Users can create documents" ON documents;
CREATE POLICY "Users can create documents" ON documents
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update their documents" ON documents;
CREATE POLICY "Owners can update their documents" ON documents
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can delete their documents" ON documents;
CREATE POLICY "Owners can delete their documents" ON documents
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ===================================================
-- 23. CREATE RLS POLICIES - DOCUMENT_CONTENT
-- ===================================================

DROP POLICY IF EXISTS "Users can view content of accessible documents" ON document_content;
CREATE POLICY "Users can view content of accessible documents" ON document_content
  FOR SELECT TO authenticated USING (has_document_access(document_id, auth.uid()));

DROP POLICY IF EXISTS "Users can insert content for their documents" ON document_content;
CREATE POLICY "Users can insert content for their documents" ON document_content
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Editors can update document content" ON document_content;
CREATE POLICY "Editors can update document content" ON document_content
  FOR UPDATE TO authenticated USING (can_edit_document(document_id, auth.uid()));

-- ===================================================
-- 24. CREATE RLS POLICIES - COLLABORATORS
-- ===================================================

DROP POLICY IF EXISTS "Users can view collaborators of accessible documents" ON collaborators;
CREATE POLICY "Users can view collaborators of accessible documents" ON collaborators
  FOR SELECT TO authenticated USING (has_document_access(document_id, auth.uid()));

DROP POLICY IF EXISTS "Owners can manage collaborators" ON collaborators;
CREATE POLICY "Owners can manage collaborators" ON collaborators
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = auth.uid())
  );

-- ===================================================
-- 25. CREATE RLS POLICIES - DOCUMENT_VERSIONS
-- ===================================================

DROP POLICY IF EXISTS "Users can view versions of accessible documents" ON document_versions;
CREATE POLICY "Users can view versions of accessible documents" ON document_versions
  FOR SELECT TO authenticated USING (has_document_access(document_id, auth.uid()));

DROP POLICY IF EXISTS "System can create versions" ON document_versions;
CREATE POLICY "System can create versions" ON document_versions
  FOR INSERT TO authenticated WITH CHECK (can_edit_document(document_id, auth.uid()));

-- ===================================================
-- 26. CREATE RLS POLICIES - COMMENTS
-- ===================================================

DROP POLICY IF EXISTS "Users can view comments on accessible documents" ON comments;
CREATE POLICY "Users can view comments on accessible documents" ON comments
  FOR SELECT TO authenticated USING (has_document_access(document_id, auth.uid()));

DROP POLICY IF EXISTS "Users can create comments on accessible documents" ON comments;
CREATE POLICY "Users can create comments on accessible documents" ON comments
  FOR INSERT TO authenticated WITH CHECK (
    has_document_access(document_id, auth.uid()) AND user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ===================================================
-- 27. CREATE RLS POLICIES - ACTIVE_USERS
-- ===================================================

DROP POLICY IF EXISTS "Users can view active users on accessible documents" ON active_users;
CREATE POLICY "Users can view active users on accessible documents" ON active_users
  FOR SELECT TO authenticated USING (has_document_access(document_id, auth.uid()));

DROP POLICY IF EXISTS "Users can update their own presence" ON active_users;
CREATE POLICY "Users can update their own presence" ON active_users
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- ===================================================
-- 28. CREATE RLS POLICIES - DOCUMENT_INVITATIONS
-- ===================================================

DROP POLICY IF EXISTS "Anyone can view invitation by token" ON document_invitations;
CREATE POLICY "Anyone can view invitation by token" ON document_invitations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Document owners can create invitations" ON document_invitations;
CREATE POLICY "Document owners can create invitations" ON document_invitations
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Document owners can view their invitations" ON document_invitations;
CREATE POLICY "Document owners can view their invitations" ON document_invitations
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Document owners can update their invitations" ON document_invitations;
CREATE POLICY "Document owners can update their invitations" ON document_invitations
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update invitations they accept" ON document_invitations;
CREATE POLICY "Users can update invitations they accept" ON document_invitations
  FOR UPDATE TO authenticated USING (auth.uid() = accepted_by);

DROP POLICY IF EXISTS "Document owners can delete their invitations" ON document_invitations;
CREATE POLICY "Document owners can delete their invitations" ON document_invitations
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = auth.uid())
  );

-- ===================================================
-- 29. CREATE RLS POLICIES - CODE_DOCUMENTS
-- ===================================================

DROP POLICY IF EXISTS "Users can view their own code documents" ON code_documents;
CREATE POLICY "Users can view their own code documents" ON code_documents
  FOR SELECT TO authenticated USING (
    owner_id = auth.uid() OR
    id IN (SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create code documents" ON code_documents;
CREATE POLICY "Users can create code documents" ON code_documents
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update their code documents" ON code_documents;
CREATE POLICY "Owners can update their code documents" ON code_documents
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can delete their code documents" ON code_documents;
CREATE POLICY "Owners can delete their code documents" ON code_documents
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ===================================================
-- 30. CREATE RLS POLICIES - CODE_CONTENT
-- ===================================================

DROP POLICY IF EXISTS "Users can view code content they have access to" ON code_content;
CREATE POLICY "Users can view code content they have access to" ON code_content
  FOR SELECT TO authenticated USING (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert code content" ON code_content;
CREATE POLICY "Users can insert code content" ON code_content
  FOR INSERT TO authenticated WITH CHECK (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

DROP POLICY IF EXISTS "Users can update code content" ON code_content;
CREATE POLICY "Users can update code content" ON code_content
  FOR UPDATE TO authenticated USING (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- ===================================================
-- 31. CREATE RLS POLICIES - CODE_COLLABORATORS
-- ===================================================

DROP POLICY IF EXISTS "Users can view collaborators" ON code_collaborators;
CREATE POLICY "Users can view collaborators" ON code_collaborators
  FOR SELECT TO authenticated USING (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can manage collaborators" ON code_collaborators;
CREATE POLICY "Owners can manage collaborators" ON code_collaborators
  FOR ALL TO authenticated USING (
    code_document_id IN (SELECT id FROM code_documents WHERE owner_id = auth.uid())
  );

-- ===================================================
-- 32. CREATE RLS POLICIES - CODE_COMMENTS
-- ===================================================

DROP POLICY IF EXISTS "Users can view code comments" ON code_comments;
CREATE POLICY "Users can view code comments" ON code_comments
  FOR SELECT TO authenticated USING (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create code comments" ON code_comments;
CREATE POLICY "Users can create code comments" ON code_comments
  FOR INSERT TO authenticated WITH CHECK (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own code comments" ON code_comments;
CREATE POLICY "Users can update their own code comments" ON code_comments
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own code comments" ON code_comments;
CREATE POLICY "Users can delete their own code comments" ON code_comments
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ===================================================
-- 33. CREATE RLS POLICIES - CODE_VERSIONS
-- ===================================================

DROP POLICY IF EXISTS "Users can view code versions" ON code_versions;
CREATE POLICY "Users can view code versions" ON code_versions
  FOR SELECT TO authenticated USING (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create code versions" ON code_versions;
CREATE POLICY "Users can create code versions" ON code_versions
  FOR INSERT TO authenticated WITH CHECK (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- ===================================================
-- 34. CREATE RLS POLICIES - CODE_ACTIVE_USERS
-- ===================================================

DROP POLICY IF EXISTS "Users can view active code users" ON code_active_users;
CREATE POLICY "Users can view active code users" ON code_active_users
  FOR SELECT TO authenticated USING (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage their code presence" ON code_active_users;
CREATE POLICY "Users can manage their code presence" ON code_active_users
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- ===================================================
-- 35. CREATE STORAGE BUCKET FOR PROFILE IMAGES
-- ===================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_images', 'profile_images', true)
ON CONFLICT (id) DO NOTHING;

-- ===================================================
-- 36. CREATE STORAGE POLICIES FOR PROFILE IMAGES
-- ===================================================

-- Allow authenticated users to upload their own profile pictures
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile_images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own profile pictures
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile_images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own profile pictures
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile_images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow everyone to view profile pictures (public bucket)
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile_images');

-- ===================================================
-- SCHEMA SETUP COMPLETE
-- ===================================================
-- All tables, indexes, policies, and triggers have been created
-- The application is now ready to use!
