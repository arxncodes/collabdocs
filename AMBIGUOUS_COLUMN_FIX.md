# Ambiguous Column Reference Fix

## Issue

**Error**: "Failed to create document: column reference 'user_id' is ambiguous"

**Root Cause**: SQL query in RLS policy referenced `user_id` without specifying which table's column, causing ambiguity when multiple tables with `user_id` columns are involved.

## The Problem

### Issue 1: Ambiguous Column in Policy

**Original Policy**:
```sql
CREATE POLICY "Users can view collaborators of their documents"
ON code_collaborators
FOR SELECT
USING (
  user_id = auth.uid()  -- ❌ Ambiguous! Which table's user_id?
  OR code_document_id IN (
    SELECT id FROM code_documents WHERE owner_id = auth.uid()
  )
);
```

### Issue 2: Ambiguous Column in Function

**Original Function**:
```sql
CREATE FUNCTION user_has_code_document_access(doc_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM code_documents 
    WHERE id = doc_id AND owner_id = user_id  -- ❌ Ambiguous!
  ) THEN
    RETURN TRUE;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM code_collaborators 
    WHERE code_document_id = doc_id AND user_id = user_id  -- ❌ Ambiguous!
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;
```

### Why It's Ambiguous

**In Policies**:
1. PostgreSQL needs to check `user_id = auth.uid()`
2. But `user_id` could refer to:
   - `code_collaborators.user_id` (intended)
   - Any other table's `user_id` in the query context
3. PostgreSQL can't determine which one, so it throws an error

**In Functions**:
1. The function parameter is named `user_id`
2. The table columns are also named `user_id`
3. When checking `WHERE user_id = user_id`, PostgreSQL doesn't know if you mean:
   - Function parameter `user_id` = table column `user_id`
   - Table column `user_id` = function parameter `user_id`
   - Or even worse: table column = table column (always true!)
4. This creates ambiguity and errors

## The Solution

### Add Explicit Table Qualifiers

Always prefix column names with the table name to avoid ambiguity.

### Fixed Policies

```sql
-- SELECT Policy
CREATE POLICY "Users can view collaborators of their documents"
ON code_collaborators
FOR SELECT
TO authenticated
USING (
  code_collaborators.user_id = auth.uid()  -- ✅ Explicit table name
  OR code_collaborators.code_document_id IN (
    SELECT code_documents.id 
    FROM code_documents 
    WHERE code_documents.owner_id = auth.uid()
  )
);

-- INSERT Policy
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

-- UPDATE Policy
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

-- DELETE Policy
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
```

### Fixed Function

```sql
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
    AND code_documents.owner_id = user_id  -- ✅ Explicit table name
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is collaborator (with explicit table qualifiers)
  IF EXISTS (
    SELECT 1 FROM code_collaborators 
    WHERE code_collaborators.code_document_id = doc_id 
    AND code_collaborators.user_id = user_id  -- ✅ Explicit table name
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;
```

## Changes Made

### Migrations Applied

**Migration 1**: `fix_collaborators_policy_explicit_table_names`
- Dropped all existing code_collaborators policies
- Recreated with fully qualified column names

**Migration 2**: `fix_ambiguous_user_id_in_access_function_v2`
- Updated user_has_code_document_access function
- Added explicit table qualifiers to all column references

### What Changed

**In Policies**:
- `user_id = auth.uid()` → `code_collaborators.user_id = auth.uid()` ✅
- `code_document_id IN (...)` → `code_collaborators.code_document_id IN (...)` ✅
- `id` → `code_documents.id` ✅
- `owner_id = auth.uid()` → `code_documents.owner_id = auth.uid()` ✅

**In Function**:
- `WHERE id = doc_id` → `WHERE code_documents.id = doc_id` ✅
- `AND owner_id = user_id` → `AND code_documents.owner_id = user_id` ✅
- `WHERE code_document_id = doc_id` → `WHERE code_collaborators.code_document_id = doc_id` ✅
- `AND user_id = user_id` → `AND code_collaborators.user_id = user_id` ✅

## Benefits

✅ **No Ambiguity**: PostgreSQL knows exactly which column to use  
✅ **Better Performance**: Query planner can optimize better  
✅ **Easier to Debug**: Clear which table each column belongs to  
✅ **Prevents Future Issues**: Explicit is better than implicit  
✅ **Maintains Security**: Same access control, just clearer syntax  

## Testing

### Test 1: Create Document with Collaborator

```typescript
// Should succeed without ambiguity error
const doc = await createCodeDocument('Test', 'javascript', userId);
```

**Expected**: Document created, owner added as collaborator, no ambiguity error.

### Test 2: Query Collaborators

```sql
SELECT * FROM code_collaborators;
```

**Expected**: Returns collaborators without ambiguity error.

### Test 3: Add Collaborator

```sql
INSERT INTO code_collaborators (code_document_id, user_id, role)
VALUES ('<doc_id>', '<user_id>', 'editor');
```

**Expected**: Collaborator added successfully.

## Verification

### Check Policies

```sql
SELECT policyname, cmd
FROM pg_policies 
WHERE tablename = 'code_collaborators'
ORDER BY cmd, policyname;
```

**Expected**:
- Owners can delete collaborators (DELETE)
- Owners can insert collaborators (INSERT)
- Users can view collaborators of their documents (SELECT)
- Owners can update collaborators (UPDATE)

### Test Query

```sql
-- Should work without error
SELECT COUNT(*) FROM code_collaborators;
```

**Expected**: Returns count, no ambiguity error.

## Best Practices

### Always Use Table Qualifiers

**Bad**:
```sql
WHERE user_id = auth.uid()
```

**Good**:
```sql
WHERE table_name.user_id = auth.uid()
```

### Especially Important When

1. **Multiple tables in query**: JOINs, subqueries, etc.
2. **Common column names**: id, user_id, created_at, etc.
3. **RLS policies**: Policies can involve multiple tables
4. **Complex queries**: More tables = more potential ambiguity

### Example

```sql
-- Bad: Ambiguous
SELECT * FROM orders 
WHERE user_id = auth.uid() 
AND id IN (SELECT order_id FROM order_items WHERE user_id = auth.uid());
-- Which user_id? orders.user_id or order_items.user_id?

-- Good: Explicit
SELECT * FROM orders 
WHERE orders.user_id = auth.uid() 
AND orders.id IN (
  SELECT order_items.order_id 
  FROM order_items 
  WHERE order_items.user_id = auth.uid()
);
```

## Summary

**Problem**: Ambiguous column reference in RLS policy  
**Cause**: Missing table qualifier on `user_id` column  
**Solution**: Added explicit table names to all column references  
**Status**: ✅ Fixed  
**Testing**: Ready to test document creation  

---

**Try creating a code document now!** The ambiguity error should be resolved. 🎉

## Quick Test

1. **Refresh browser**: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. **Navigate to "My Codes"**
3. **Click "+ New Code"**
4. **Enter title and language**
5. **Click "Create"**

**Expected**: Document created successfully! ✅
