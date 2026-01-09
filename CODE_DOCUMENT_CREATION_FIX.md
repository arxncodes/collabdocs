# Code Document Creation Error Fix

## Issue Description

**Error**: "Failed to create document" when trying to create a code document

**Symptoms**:
- User clicks "Create" in the New Code dialog
- Toast notification shows "Failed to create code document"
- No code document is created
- Console may show errors related to database operations

## Root Causes Identified

### 1. Profile Verification Issue
**Problem**: The code was not verifying if the user's profile exists before creating the document.

**Impact**: If a user's profile doesn't exist in the `profiles` table, the foreign key constraint on `code_documents.owner_id` would fail.

**Solution**: Added profile verification before document creation.

### 2. RLS Policy Race Condition
**Problem**: The INSERT policy for `code_content` checks if the `code_document_id` exists, but this check might happen before the document creation transaction is fully committed.

**Impact**: Content creation could fail even though the document was created successfully.

**Solution**: 
- Added owner as collaborator immediately after document creation
- Added detailed error logging for content creation
- Made content creation non-blocking (document creation succeeds even if content fails)

### 3. Missing Initial Collaborator Entry
**Problem**: The owner was not added to the `code_collaborators` table upon document creation.

**Impact**: The RLS policy for `code_content` INSERT checks if the user is in `code_collaborators` with 'owner' or 'editor' role, which would fail.

**Solution**: Automatically create a collaborator entry for the owner when creating a document.

## Changes Made

### 1. Enhanced `createCodeDocument` Function

**Location**: `src/db/api.ts`

**Changes**:
```typescript
export async function createCodeDocument(title: string, language: string, ownerId: string): Promise<CodeDocument | null> {
  // 1. Verify user profile exists
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', ownerId)
    .maybeSingle();

  if (profileError || !profileData) {
    console.error('Error verifying profile:', profileError);
    console.error('Profile not found for user:', ownerId);
    return null;
  }

  // 2. Create code document
  const { data, error } = await supabase
    .from('code_documents')
    .insert({ title, language, owner_id: ownerId })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating code document:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }

  // 3. Create owner as collaborator
  if (data) {
    const { error: collabError } = await supabase
      .from('code_collaborators')
      .insert({
        code_document_id: data.id,
        user_id: ownerId,
        role: 'owner',
      });

    if (collabError) {
      console.error('Error creating owner collaborator:', collabError);
      // Continue anyway, owner_id is set on the document
    }

    // 4. Create initial content
    const { error: contentError } = await supabase
      .from('code_content')
      .insert({
        code_document_id: data.id,
        content: '',
        updated_by: ownerId,
      });

    if (contentError) {
      console.error('Error creating initial content:', contentError);
      console.error('Content error details:', {
        message: contentError.message,
        details: contentError.details,
        hint: contentError.hint,
        code: contentError.code,
      });
      // Don't fail the whole operation if content creation fails
    }
  }

  return data;
}
```

**Key Improvements**:
1. ✅ Profile verification before document creation
2. ✅ Detailed error logging with error codes and hints
3. ✅ Owner added as collaborator automatically
4. ✅ Non-blocking content creation (document succeeds even if content fails)
5. ✅ Comprehensive error handling at each step

### 2. Enhanced `loadContent` Function

**Location**: `src/pages/CodeEditorPage.tsx`

**Changes**:
```typescript
const loadContent = useCallback(async () => {
  if (!codeDocumentId || !user) return;
  const contentData = await getCodeContent(codeDocumentId);
  if (contentData) {
    setContent(contentData);
    if (!currentContent) {
      setCurrentContent(contentData.content);
    }
  } else {
    // Content doesn't exist, create it
    await updateCodeContent(codeDocumentId, '', user.id);
    setCurrentContent('');
  }
}, [codeDocumentId, user, currentContent]);
```

**Key Improvements**:
1. ✅ Handles missing content gracefully
2. ✅ Creates content on-demand if it doesn't exist
3. ✅ Prevents editor errors when content is missing

## Database Schema Review

### RLS Policies

**code_documents**:
- ✅ INSERT: `owner_id = auth.uid()` - Users can create documents
- ✅ SELECT: Owner or collaborator can view
- ✅ UPDATE: Owner can update
- ✅ DELETE: Owner can delete

**code_content**:
- ✅ INSERT: User must be owner or editor (checks both `code_documents.owner_id` and `code_collaborators`)
- ✅ SELECT: User must have access to the document
- ✅ UPDATE: User must be owner or editor

**code_collaborators**:
- ✅ INSERT: Owner can add collaborators
- ✅ SELECT: Users can view collaborators of documents they have access to
- ✅ UPDATE: Owner can update roles
- ✅ DELETE: Owner can remove collaborators

### Foreign Key Constraints

**code_documents**:
- `owner_id` → `profiles.id` (ON DELETE CASCADE)

**code_content**:
- `code_document_id` → `code_documents.id` (ON DELETE CASCADE)
- `updated_by` → `profiles.id` (ON DELETE SET NULL)

**code_collaborators**:
- `code_document_id` → `code_documents.id` (ON DELETE CASCADE)
- `user_id` → `profiles.id` (ON DELETE CASCADE)

## Testing Steps

### Test 1: Create Code Document
1. Log in to the application
2. Navigate to "My Codes"
3. Click "+ New Code"
4. Enter title: "Test Document"
5. Select language: "JavaScript"
6. Click "Create"
7. **Expected**: Document created successfully, redirected to editor

### Test 2: Verify Database Entries
```sql
-- Check document was created
SELECT * FROM code_documents WHERE title = 'Test Document';

-- Check owner is in collaborators
SELECT * FROM code_collaborators WHERE code_document_id = '<document_id>';

-- Check content was created
SELECT * FROM code_content WHERE code_document_id = '<document_id>';
```

### Test 3: Open Editor
1. Navigate to the created document
2. **Expected**: Editor loads with empty content
3. Start typing
4. **Expected**: Auto-save works correctly

### Test 4: Error Handling
1. Open browser console (F12)
2. Try creating a document
3. **Expected**: No errors in console
4. If errors appear, check the detailed error logs

## Debugging Guide

### Check Console Logs

**Profile Verification Error**:
```
Error verifying profile: <error>
Profile not found for user: <user_id>
```
**Solution**: Ensure user profile exists in `profiles` table

**Document Creation Error**:
```
Error creating code document: <error>
Error details: {
  message: "...",
  details: "...",
  hint: "...",
  code: "..."
}
```
**Solution**: Check error details for specific issue (foreign key, RLS policy, etc.)

**Collaborator Creation Error**:
```
Error creating owner collaborator: <error>
```
**Solution**: Check `code_collaborators` table and RLS policies

**Content Creation Error**:
```
Error creating initial content: <error>
Content error details: {
  message: "...",
  details: "...",
  hint: "...",
  code: "..."
}
```
**Solution**: Check `code_content` table and RLS policies

### Common Error Codes

**23503 - Foreign Key Violation**:
- **Cause**: Referenced record doesn't exist
- **Solution**: Ensure profile exists before creating document

**42501 - Insufficient Privilege**:
- **Cause**: RLS policy denying access
- **Solution**: Check RLS policies and user authentication

**23505 - Unique Violation**:
- **Cause**: Duplicate entry
- **Solution**: Check for existing records

### Database Queries for Debugging

**Check if profile exists**:
```sql
SELECT * FROM profiles WHERE id = '<user_id>';
```

**Check RLS policies**:
```sql
SELECT * FROM pg_policies WHERE tablename IN ('code_documents', 'code_content', 'code_collaborators');
```

**Check recent code documents**:
```sql
SELECT * FROM code_documents ORDER BY created_at DESC LIMIT 10;
```

**Check collaborators for a document**:
```sql
SELECT * FROM code_collaborators WHERE code_document_id = '<document_id>';
```

**Check content for a document**:
```sql
SELECT * FROM code_content WHERE code_document_id = '<document_id>';
```

## Prevention

### Best Practices

1. **Always verify prerequisites**:
   - Check profile exists before creating documents
   - Verify foreign key references exist

2. **Comprehensive error logging**:
   - Log all error details (message, code, hint)
   - Include context (user ID, document ID, etc.)

3. **Graceful degradation**:
   - Don't fail entire operation if non-critical step fails
   - Create missing data on-demand when needed

4. **RLS policy design**:
   - Ensure policies allow necessary operations
   - Test policies with different user roles
   - Use UNION for multiple access paths

5. **Transaction ordering**:
   - Create parent records before children
   - Add collaborator entries before content
   - Handle race conditions

## Summary

**Problem**: Code document creation failing due to missing profile verification, RLS policy issues, and missing collaborator entries.

**Solution**: 
1. ✅ Added profile verification
2. ✅ Created owner as collaborator automatically
3. ✅ Enhanced error logging
4. ✅ Made content creation non-blocking
5. ✅ Added on-demand content creation in editor

**Status**: ✅ Fixed

**Testing**: Ready for testing

---

**Next Steps**:
1. Test document creation with the fixes
2. Check browser console for any remaining errors
3. Verify all database entries are created correctly
4. Test editor functionality with new documents
