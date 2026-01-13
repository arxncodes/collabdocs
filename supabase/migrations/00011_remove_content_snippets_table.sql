-- Remove content_snippets table and related objects

-- Drop trigger
DROP TRIGGER IF EXISTS update_content_snippets_updated_at_trigger ON content_snippets;

-- Drop function
DROP FUNCTION IF EXISTS update_content_snippets_updated_at();

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own snippets" ON content_snippets;
DROP POLICY IF EXISTS "Users can insert their own snippets" ON content_snippets;
DROP POLICY IF EXISTS "Users can update their own snippets" ON content_snippets;
DROP POLICY IF EXISTS "Users can delete their own snippets" ON content_snippets;

-- Drop indexes
DROP INDEX IF EXISTS idx_content_snippets_user_id;
DROP INDEX IF EXISTS idx_content_snippets_category;
DROP INDEX IF EXISTS idx_content_snippets_search;

-- Drop table
DROP TABLE IF EXISTS content_snippets;