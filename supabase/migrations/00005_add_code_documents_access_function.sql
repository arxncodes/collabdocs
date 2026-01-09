-- Create a security definer function to check document access
-- This avoids infinite recursion by not using RLS in the function

CREATE OR REPLACE FUNCTION user_has_code_document_access(doc_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is owner
  IF EXISTS (
    SELECT 1 FROM code_documents 
    WHERE id = doc_id AND owner_id = user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is collaborator
  IF EXISTS (
    SELECT 1 FROM code_collaborators 
    WHERE code_document_id = doc_id AND user_id = user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Update code_documents SELECT policy to use the function
DROP POLICY IF EXISTS "Users can view their own code documents" ON code_documents;

CREATE POLICY "Users can view accessible code documents"
ON code_documents
FOR SELECT
TO authenticated
USING (user_has_code_document_access(id, auth.uid()));