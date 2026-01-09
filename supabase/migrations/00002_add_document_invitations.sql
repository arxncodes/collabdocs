-- Create invitation status enum
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined');

-- Create document_invitations table
CREATE TABLE public.document_invitations (
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

-- Create indexes
CREATE INDEX idx_invitations_token ON public.document_invitations(token);
CREATE INDEX idx_invitations_document ON public.document_invitations(document_id);
CREATE INDEX idx_invitations_status ON public.document_invitations(status);

-- Enable RLS
ALTER TABLE public.document_invitations ENABLE ROW LEVEL SECURITY;

-- Invitations policies
CREATE POLICY "Anyone can view invitation by token" ON document_invitations
  FOR SELECT USING (true);

CREATE POLICY "Document owners can create invitations" ON document_invitations
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = auth.uid())
  );

CREATE POLICY "Document owners can view their invitations" ON document_invitations
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = auth.uid())
  );

CREATE POLICY "Document owners can update their invitations" ON document_invitations
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = auth.uid())
  );

CREATE POLICY "Users can update invitations they accept" ON document_invitations
  FOR UPDATE TO authenticated USING (auth.uid() = accepted_by);

CREATE POLICY "Document owners can delete their invitations" ON document_invitations
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = auth.uid())
  );