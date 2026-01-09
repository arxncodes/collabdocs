-- Fix ambiguous user_id in the security definer function
-- Use CREATE OR REPLACE to update the function without dropping it

CREATE OR REPLACE FUNCTION user_has_code_document_access(doc_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is owner (with explicit table qualifiers)
  IF EXISTS (
    SELECT 1 FROM code_documents 
    WHERE code_documents.id = doc_id 
    AND code_documents.owner_id = user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is collaborator (with explicit table qualifiers)
  IF EXISTS (
    SELECT 1 FROM code_collaborators 
    WHERE code_collaborators.code_document_id = doc_id 
    AND code_collaborators.user_id = user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;