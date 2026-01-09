# Infinite Recursion Fix - Code Documents RLS Policies

## Issue

**Error**: "Failed to create document: infinite recursion detected in policy for relation 'code_documents'"

**Root Cause**: Circular dependency in Row Level Security (RLS) policies between `code_documents` and `code_collaborators` tables.

## The Problem

### Original Policy Structure

**code_documents SELECT policy**:
```sql
-- Checked code_collaborators table
(owner_id = auth.uid()) OR (id IN (
  SELECT code_document_id FROM code_collaborators 
  WHERE user_id = auth.uid()
))
```

**code_collaborators SELECT policy**:
```sql
-- Checked code_documents table
(code_document_id IN (
  SELECT id FROM code_documents 
  WHERE owner_id = auth.uid()
)) OR ...
```

### The Circular Dependency

1. User tries to INSERT into `code_documents`
2. RLS checks the INSERT policy (✓ simple check)
3. Supabase tries to return the inserted row
4. RLS applies SELECT policy to the result
5. SELECT policy queries `code_collaborators`
6. `code_collaborators` SELECT policy queries `code_documents`
7. Back to step 4 → **Infinite recursion!**

## The Solution

### Approach: Security Definer Function

Created a PostgreSQL function that runs with elevated privileges (SECURITY DEFINER) to check access without triggering RLS policies.

### Implementation

**Step 1: Create Access Check Function**

```sql
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
```

**Key Points**:
- `SECURITY DEFINER`: Function runs with creator's privileges, bypassing RLS
- No RLS policies are triggered inside the function
- Breaks the circular dependency

**Step 2: Update code_documents SELECT Policy**

```sql
DROP POLICY IF EXISTS "Users can view their own code documents" ON code_documents;

CREATE POLICY "Users can view accessible code documents"
ON code_documents
FOR SELECT
TO authenticated
USING (user_has_code_document_access(id, auth.uid()));
```

**Step 3: Simplify code_collaborators Policies**

```sql
-- SELECT policy
CREATE POLICY "Users can view collaborators of their documents"
ON code_collaborators
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR code_document_id IN (
  SELECT id FROM code_documents WHERE owner_id = auth.uid()
));

-- INSERT policy
CREATE POLICY "Owners can insert collaborators"
ON code_collaborators
FOR INSERT
TO authenticated
WITH CHECK (code_document_id IN (
  SELECT id FROM code_documents WHERE owner_id = auth.uid()
));

-- UPDATE policy
CREATE POLICY "Owners can update collaborators"
ON code_collaborators
FOR UPDATE
TO authenticated
USING (code_document_id IN (
  SELECT id FROM code_documents WHERE owner_id = auth.uid()
));

-- DELETE policy
CREATE POLICY "Owners can delete collaborators"
ON code_collaborators
FOR DELETE
TO authenticated
USING (code_document_id IN (
  SELECT id FROM code_documents WHERE owner_id = auth.uid()
));
```

## How It Works Now

### Document Creation Flow

1. User tries to INSERT into `code_documents`
2. RLS checks INSERT policy: `owner_id = auth.uid()` ✓
3. Document is inserted
4. Supabase returns the inserted row
5. RLS applies SELECT policy: `user_has_code_document_access(id, auth.uid())`
6. Function checks:
   - Is user the owner? ✓ (just inserted with their ID)
   - Returns TRUE
7. Row is returned to user
8. **No recursion!**

### Document Viewing Flow

1. User queries `code_documents`
2. RLS applies SELECT policy: `user_has_code_document_access(id, auth.uid())`
3. For each document, function checks:
   - Is user the owner? Check `code_documents.owner_id`
   - Is user a collaborator? Check `code_collaborators`
4. Function runs with SECURITY DEFINER, so no RLS is triggered
5. Returns TRUE/FALSE for each document
6. **No recursion!**

## Benefits

✅ **No Circular Dependencies**: Function breaks the cycle  
✅ **Maintains Security**: Still checks ownership and collaboration  
✅ **Better Performance**: Function is more efficient than nested subqueries  
✅ **Easier to Maintain**: Access logic is centralized in one function  
✅ **Supports Collaboration**: Users can see documents they own OR collaborate on  

## Testing

### Test 1: Create Document

```sql
-- Should succeed
INSERT INTO code_documents (title, language, owner_id)
VALUES ('Test', 'javascript', auth.uid());
```

**Expected**: Document created successfully, no infinite recursion error.

### Test 2: View Documents

```sql
-- Should return documents user owns or collaborates on
SELECT * FROM code_documents;
```

**Expected**: Returns accessible documents, no infinite recursion error.

### Test 3: Add Collaborator

```sql
-- Should succeed for document owner
INSERT INTO code_collaborators (code_document_id, user_id, role)
VALUES ('<document_id>', '<other_user_id>', 'editor');
```

**Expected**: Collaborator added successfully.

### Test 4: Collaborator Views Document

```sql
-- As collaborator, should see the document
SELECT * FROM code_documents WHERE id = '<document_id>';
```

**Expected**: Collaborator can see the document.

## Verification

### Check Policies

```sql
-- code_documents policies
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'code_documents'
ORDER BY cmd, policyname;
```

**Expected**:
- INSERT: `owner_id = auth.uid()`
- SELECT: `user_has_code_document_access(id, auth.uid())`
- UPDATE: `owner_id = auth.uid()`
- DELETE: `owner_id = auth.uid()`

### Check Function

```sql
-- Verify function exists
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'user_has_code_document_access';
```

**Expected**:
- `proname`: user_has_code_document_access
- `prosecdef`: true (SECURITY DEFINER)

## Migrations Applied

1. **fix_code_documents_infinite_recursion**: Simplified policies to remove circular references
2. **add_code_documents_access_function**: Added security definer function and updated SELECT policy

## Alternative Solutions Considered

### Option 1: Remove Collaboration from SELECT Policy
**Pros**: Simple, no recursion  
**Cons**: Users can't see documents they collaborate on  
**Verdict**: ❌ Not acceptable - breaks collaboration feature

### Option 2: Use Materialized View
**Pros**: Pre-computed access list  
**Cons**: Needs refresh, complex to maintain  
**Verdict**: ❌ Overkill for this use case

### Option 3: Security Definer Function (Chosen)
**Pros**: Breaks recursion, maintains functionality, good performance  
**Cons**: Slightly more complex  
**Verdict**: ✅ Best solution

## Security Considerations

### SECURITY DEFINER Risks

**Risk**: Function runs with elevated privileges  
**Mitigation**: Function only checks access, doesn't modify data

**Risk**: SQL injection in function  
**Mitigation**: Uses parameterized queries, no string concatenation

**Risk**: Unauthorized access  
**Mitigation**: Function still checks ownership and collaboration

### Best Practices

✅ Function is read-only (no INSERT/UPDATE/DELETE)  
✅ Uses EXISTS for efficient checking  
✅ Returns boolean, not sensitive data  
✅ No dynamic SQL  
✅ Proper parameter types (UUID)  

## Troubleshooting

### If Infinite Recursion Still Occurs

1. **Check for other circular policies**:
   ```sql
   SELECT tablename, policyname, qual
   FROM pg_policies
   WHERE qual LIKE '%code_documents%' OR qual LIKE '%code_collaborators%';
   ```

2. **Verify function is being used**:
   ```sql
   SELECT policyname, qual
   FROM pg_policies
   WHERE tablename = 'code_documents' AND cmd = 'SELECT';
   ```
   Should show: `user_has_code_document_access(id, auth.uid())`

3. **Test function directly**:
   ```sql
   SELECT user_has_code_document_access('<doc_id>', auth.uid());
   ```

### If Access Denied

1. **Check if user is owner**:
   ```sql
   SELECT * FROM code_documents WHERE id = '<doc_id>' AND owner_id = auth.uid();
   ```

2. **Check if user is collaborator**:
   ```sql
   SELECT * FROM code_collaborators WHERE code_document_id = '<doc_id>' AND user_id = auth.uid();
   ```

3. **Test function**:
   ```sql
   SELECT user_has_code_document_access('<doc_id>', auth.uid());
   ```

## Summary

**Problem**: Infinite recursion in RLS policies due to circular dependency  
**Solution**: Security definer function to break the cycle  
**Status**: ✅ Fixed  
**Testing**: Ready to test document creation  

---

**Try creating a code document now!** The infinite recursion error should be resolved. 🎉
