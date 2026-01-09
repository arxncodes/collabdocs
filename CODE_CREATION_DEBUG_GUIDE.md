# Code Document Creation Troubleshooting Guide

## Current Status

✅ **Enhanced Error Reporting**: The application now shows detailed error messages when code document creation fails.

## How to Debug

### Step 1: Try Creating a Document Again

1. **Clear your browser cache**: Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. **Open browser console**: Press `F12` and go to the "Console" tab
3. **Try creating a code document**:
   - Click "My Codes" in sidebar
   - Click "+ New Code"
   - Enter a title
   - Select a language
   - Click "Create"

### Step 2: Check the Error Message

The error toast will now show the specific error. Look for messages like:

**"Profile not found. Please try logging out and back in."**
- **Cause**: Your user profile doesn't exist in the database
- **Solution**: Log out and log back in to recreate your profile

**"Failed to create document: new row violates row-level security policy"**
- **Cause**: RLS policy is blocking the insert
- **Solution**: See "RLS Policy Fix" below

**"Profile verification failed: [error message]"**
- **Cause**: Database connection or permission issue
- **Solution**: Check Supabase connection

### Step 3: Check Console Logs

In the browser console, you should see detailed logs:

```
Creating code document for user: <user-id>
Current session user: <session-user-id>
Owner ID: <owner-id>
Session matches owner: true/false
Profile verified: { id: <user-id> }
Document created: { id: <doc-id>, ... }
```

**If "Session matches owner" is FALSE**:
- The Supabase session user ID doesn't match the owner ID
- This will cause RLS policy to block the insert
- **Solution**: Log out and log back in

**If "Profile verified" doesn't appear**:
- Profile doesn't exist
- **Solution**: Log out and log back in

**If you see "Error creating code document"**:
- Check the error details in the console
- Look for error code (e.g., 42501 = RLS policy violation)

## Common Issues and Solutions

### Issue 1: RLS Policy Blocking Insert

**Symptoms**:
- Error: "new row violates row-level security policy"
- Console shows: "Session matches owner: false"

**Root Cause**:
The RLS policy checks if `owner_id = auth.uid()`, but the session user ID doesn't match.

**Solution**:
1. Log out of the application
2. Log back in
3. Try creating a document again

**If that doesn't work**, we need to check the RLS policy:

```sql
-- Check current policy
SELECT policyname, with_check
FROM pg_policies 
WHERE tablename = 'code_documents' 
AND cmd = 'INSERT';

-- Expected result:
-- policyname: "Users can create code documents"
-- with_check: "(owner_id = auth.uid())"
```

### Issue 2: Profile Not Found

**Symptoms**:
- Error: "Profile not found. Please try logging out and back in."
- Console shows: "Profile not found for user: <user-id>"

**Root Cause**:
Your user profile doesn't exist in the `profiles` table.

**Solution**:
1. Log out of the application
2. Log back in (this should create your profile)
3. Try creating a document again

**If that doesn't work**, check if profile exists:

```sql
-- Check if profile exists
SELECT * FROM profiles WHERE id = '<your-user-id>';

-- If no results, create profile manually:
INSERT INTO profiles (id, username, email, role)
VALUES (
  '<your-user-id>',
  '<your-username>',
  '<your-email>',
  'user'
);
```

### Issue 3: Collaborator Creation Fails

**Symptoms**:
- Document is created
- Console shows: "Error creating owner collaborator"
- Content creation might also fail

**Root Cause**:
RLS policy on `code_collaborators` table might be blocking the insert.

**Solution**:
This is non-critical - the document is still created. The collaborator entry will be created when you open the document.

### Issue 4: Content Creation Fails

**Symptoms**:
- Document is created
- Console shows: "Error creating initial content"
- Editor might show empty content

**Root Cause**:
RLS policy on `code_content` table requires collaborator entry to exist.

**Solution**:
This is non-critical - the content will be created automatically when you open the editor.

## RLS Policy Fix (For Developers)

If the RLS policy is blocking inserts, you can temporarily make it more permissive:

### Option 1: Allow All Authenticated Users (Temporary)

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Users can create code documents" ON code_documents;

-- Create more permissive policy
CREATE POLICY "Users can create code documents"
ON code_documents
FOR INSERT
TO authenticated
WITH CHECK (true);
```

**Warning**: This allows any authenticated user to create documents with any owner_id. Only use for testing!

### Option 2: Fix Session Issue

The proper fix is to ensure the Supabase session is set correctly:

```typescript
// In supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

### Option 3: Use Service Role (For Server-Side)

If you're calling this from a server, use the service role key:

```typescript
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
```

## Testing Checklist

- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Open browser console (F12)
- [ ] Try creating a code document
- [ ] Check error message in toast
- [ ] Check console logs for details
- [ ] Verify session user ID matches owner ID
- [ ] Verify profile exists
- [ ] If error persists, check RLS policies

## Expected Console Output (Success)

```
Creating code document for user: abc123-def456-...
Current session user: abc123-def456-...
Owner ID: abc123-def456-...
Session matches owner: true
Profile verified: { id: "abc123-def456-..." }
Document created: { id: "xyz789-...", title: "Test", language: "javascript", ... }
```

## Expected Console Output (Failure)

```
Creating code document for user: abc123-def456-...
Current session user: null
Owner ID: abc123-def456-...
Session matches owner: false
Error creating code document: { message: "new row violates row-level security policy", ... }
createCodeDocument error: Error: Failed to create document: new row violates row-level security policy
```

## Next Steps

1. **Try the fix**: Clear cache and try creating a document
2. **Check console**: Look for the detailed logs
3. **Report back**: Share the error message and console logs
4. **If still failing**: We'll need to check the RLS policies or session handling

## Summary

**What we did**:
- ✅ Added detailed error messages
- ✅ Added console logging for debugging
- ✅ Added session verification
- ✅ Added profile verification
- ✅ Made error messages user-friendly

**What you need to do**:
1. Clear browser cache
2. Open console (F12)
3. Try creating a document
4. Check the error message and console logs
5. Report back with the details

---

**The error message will now tell you exactly what's wrong!** 🔍
