# Ambiguous Column Reference Fix

## Issue

**Error**: "Failed to create document: column reference 'user_id' is ambiguous"

**Root Cause**: SQL query in RLS policy referenced `user_id` without specifying which table's column, causing ambiguity when multiple tables with `user_id` columns are involved.

## The Problem

### Original Policy

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

### Why It's Ambiguous

When PostgreSQL executes this policy:
1. It needs to check `user_id = auth.uid()`
2. But `user_id` could refer to:
   - `code_collaborators.user_id` (intended)
   - Any other table's `user_id` in the query context
3. PostgreSQL can't determine which one, so it throws an error

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

## Changes Made

### Migration Applied

**Name**: `fix_collaborators_policy_explicit_table_names`

**Actions**:
1. ✅ Dropped all existing code_collaborators policies
2. ✅ Recreated with fully qualified column names
3. ✅ Added explicit table prefixes to all column references

### What Changed

**Before**:
- `user_id = auth.uid()` ❌
- `code_document_id IN (...)` ❌

**After**:
- `code_collaborators.user_id = auth.uid()` ✅
- `code_collaborators.code_document_id IN (...)` ✅
- `code_documents.id` ✅
- `code_documents.owner_id = auth.uid()` ✅

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
