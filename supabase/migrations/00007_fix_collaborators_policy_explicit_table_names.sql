-- Fix all code_collaborators policies with explicit table names

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view collaborators of their documents" ON code_collaborators;
DROP POLICY IF EXISTS "Owners can insert collaborators" ON code_collaborators;
DROP POLICY IF EXISTS "Owners can update collaborators" ON code_collaborators;
DROP POLICY IF EXISTS "Owners can delete collaborators" ON code_collaborators;

-- Recreate with fully qualified column names

CREATE POLICY "Users can view collaborators of their documents"
ON code_collaborators
FOR SELECT
TO authenticated
USING (
  code_collaborators.user_id = auth.uid() 
  OR code_collaborators.code_document_id IN (
    SELECT code_documents.id 
    FROM code_documents 
    WHERE code_documents.owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can insert collaborators"
ON code_collaborators
FOR INSERT
TO authenticated
WITH CHECK (
  code_collaborators.code_document_id IN (
    SELECT code_documents.id 
    FROM code_documents 
    WHERE code_documents.owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can update collaborators"
ON code_collaborators
FOR UPDATE
TO authenticated
USING (
  code_collaborators.code_document_id IN (
    SELECT code_documents.id 
    FROM code_documents 
    WHERE code_documents.owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can delete collaborators"
ON code_collaborators
FOR DELETE
TO authenticated
USING (
  code_collaborators.code_document_id IN (
    SELECT code_documents.id 
    FROM code_documents 
    WHERE code_documents.owner_id = auth.uid()
  )
);