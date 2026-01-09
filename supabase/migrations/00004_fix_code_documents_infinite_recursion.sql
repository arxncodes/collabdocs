-- Fix infinite recursion in code_documents and code_collaborators policies
-- The issue is circular dependency between the two tables

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own code documents" ON code_documents;
DROP POLICY IF EXISTS "Owners can manage collaborators" ON code_collaborators;
DROP POLICY IF EXISTS "Users can view collaborators" ON code_collaborators;

-- Create simplified policies without circular references

-- code_documents: Simple SELECT policy without subquery
CREATE POLICY "Users can view their own code documents"
ON code_documents
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- code_collaborators: Simple policies without referencing code_documents
CREATE POLICY "Users can view collaborators of their documents"
ON code_collaborators
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR code_document_id IN (
  SELECT id FROM code_documents WHERE owner_id = auth.uid()
));

CREATE POLICY "Owners can insert collaborators"
ON code_collaborators
FOR INSERT
TO authenticated
WITH CHECK (code_document_id IN (
  SELECT id FROM code_documents WHERE owner_id = auth.uid()
));

CREATE POLICY "Owners can update collaborators"
ON code_collaborators
FOR UPDATE
TO authenticated
USING (code_document_id IN (
  SELECT id FROM code_documents WHERE owner_id = auth.uid()
));

CREATE POLICY "Owners can delete collaborators"
ON code_collaborators
FOR DELETE
TO authenticated
USING (code_document_id IN (
  SELECT id FROM code_documents WHERE owner_id = auth.uid()
));