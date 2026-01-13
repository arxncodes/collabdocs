-- Create content_snippets table for storing user content library

CREATE TABLE IF NOT EXISTS content_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('blog', 'topic', 'paragraph', 'text', 'code', 'quote', 'link')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_content_snippets_user_id ON content_snippets(user_id);

-- Create index for category for filtering
CREATE INDEX IF NOT EXISTS idx_content_snippets_category ON content_snippets(category);

-- Create index for full-text search on title and content
CREATE INDEX IF NOT EXISTS idx_content_snippets_search ON content_snippets USING gin(to_tsvector('english', title || ' ' || content));

-- Enable RLS
ALTER TABLE content_snippets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own snippets
CREATE POLICY "Users can view their own snippets"
ON content_snippets
FOR SELECT
TO authenticated
USING (content_snippets.user_id = auth.uid());

-- Policy: Users can insert their own snippets
CREATE POLICY "Users can insert their own snippets"
ON content_snippets
FOR INSERT
TO authenticated
WITH CHECK (content_snippets.user_id = auth.uid());

-- Policy: Users can update their own snippets
CREATE POLICY "Users can update their own snippets"
ON content_snippets
FOR UPDATE
TO authenticated
USING (content_snippets.user_id = auth.uid());

-- Policy: Users can delete their own snippets
CREATE POLICY "Users can delete their own snippets"
ON content_snippets
FOR DELETE
TO authenticated
USING (content_snippets.user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_snippets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_content_snippets_updated_at_trigger
BEFORE UPDATE ON content_snippets
FOR EACH ROW
EXECUTE FUNCTION update_content_snippets_updated_at();