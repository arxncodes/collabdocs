-- Fix ambiguous user_id reference in code_collaborators SELECT policy

DROP POLICY IF EXISTS "Users can view collaborators of their documents" ON code_collaborators;

CREATE POLICY "Users can view collaborators of their documents"
ON code_collaborators
FOR SELECT
TO authenticated
USING (
  code_collaborators.user_id = auth.uid() 
  OR code_document_id IN (
    SELECT id FROM code_documents WHERE owner_id = auth.uid()
  )
);