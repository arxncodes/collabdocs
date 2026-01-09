-- Create code_documents table
CREATE TABLE IF NOT EXISTS code_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'javascript',
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create code_content table
CREATE TABLE IF NOT EXISTS code_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_document_id UUID NOT NULL REFERENCES code_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create code_collaborators table
CREATE TABLE IF NOT EXISTS code_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_document_id UUID NOT NULL REFERENCES code_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(code_document_id, user_id)
);

-- Create code_comments table
CREATE TABLE IF NOT EXISTS code_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_document_id UUID NOT NULL REFERENCES code_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  line_number INTEGER,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create code_versions table
CREATE TABLE IF NOT EXISTS code_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_document_id UUID NOT NULL REFERENCES code_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create code_active_users table
CREATE TABLE IF NOT EXISTS code_active_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_document_id UUID NOT NULL REFERENCES code_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cursor_position INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(code_document_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_code_documents_owner ON code_documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_code_content_document ON code_content(code_document_id);
CREATE INDEX IF NOT EXISTS idx_code_collaborators_document ON code_collaborators(code_document_id);
CREATE INDEX IF NOT EXISTS idx_code_collaborators_user ON code_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_code_comments_document ON code_comments(code_document_id);
CREATE INDEX IF NOT EXISTS idx_code_versions_document ON code_versions(code_document_id);
CREATE INDEX IF NOT EXISTS idx_code_active_users_document ON code_active_users(code_document_id);

-- Enable RLS
ALTER TABLE code_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_active_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for code_documents
CREATE POLICY "Users can view their own code documents" ON code_documents
  FOR SELECT TO authenticated USING (
    owner_id = auth.uid() OR
    id IN (SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create code documents" ON code_documents
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their code documents" ON code_documents
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their code documents" ON code_documents
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- RLS Policies for code_content
CREATE POLICY "Users can view code content they have access to" ON code_content
  FOR SELECT TO authenticated USING (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert code content" ON code_content
  FOR INSERT TO authenticated WITH CHECK (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Users can update code content" ON code_content
  FOR UPDATE TO authenticated USING (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- RLS Policies for code_collaborators
CREATE POLICY "Users can view collaborators" ON code_collaborators
  FOR SELECT TO authenticated USING (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage collaborators" ON code_collaborators
  FOR ALL TO authenticated USING (
    code_document_id IN (SELECT id FROM code_documents WHERE owner_id = auth.uid())
  );

-- RLS Policies for code_comments
CREATE POLICY "Users can view comments" ON code_comments
  FOR SELECT TO authenticated USING (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments" ON code_comments
  FOR INSERT TO authenticated WITH CHECK (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments" ON code_comments
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON code_comments
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- RLS Policies for code_versions
CREATE POLICY "Users can view versions" ON code_versions
  FOR SELECT TO authenticated USING (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions" ON code_versions
  FOR INSERT TO authenticated WITH CHECK (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- RLS Policies for code_active_users
CREATE POLICY "Users can view active users" ON code_active_users
  FOR SELECT TO authenticated USING (
    code_document_id IN (
      SELECT id FROM code_documents WHERE owner_id = auth.uid()
      UNION
      SELECT code_document_id FROM code_collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their presence" ON code_active_users
  FOR ALL TO authenticated USING (user_id = auth.uid());
