# CollabDocs Supabase Setup - Complete Reference

## 🎯 Quick Summary

Your CollabDocs application needs **14 tables** across **3 categories**:

### Documents (8 tables)
- profiles, documents, document_content, collaborators
- document_versions, comments, active_users, document_invitations

### Code Editor (6 tables)  
- code_documents, code_content, code_collaborators, code_comments
- code_versions, code_active_users

---

## ⚡ One-Command Setup

### Use Supabase CLI (Best Method)

```bash
cd c:\Users\badbo\Downloads\collabdocs
supabase db push
```

### Or: Copy-Paste SQL Script

**File**: `SUPABASE_COMPLETE_SCHEMA.sql`

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Paste entire file content
4. Click Run

---

## 📁 Generated Documentation Files

| File | Purpose |
|------|---------|
| **SUPABASE_COMPLETE_SCHEMA.sql** | Complete SQL to create all 14 tables with RLS + indexes |
| **SUPABASE_SETUP_COMMANDS.md** | Setup methods & verification checklist |
| **SUPABASE_TABLES_COMPLETE.md** | Detailed table descriptions & features |
| **DATABASE_SCHEMA_DIAGRAM.md** | Visual diagrams & relationships |
| **SETUP_REFERENCE.md** | This file - quick reference |

---

## 🗂️ All Tables at a Glance

### Document Collaboration Tables

```
profiles
├─ User accounts, roles, premium status
└─ Referenced by: documents, collaborators, comments, etc.

documents (has many)
├─ Text documents with metadata
└─ Owns: document_content, collaborators, comments, active_users

document_content (one-to-one)
├─ Current document content (JSONB format)
└─ Latest version of document

document_versions (has many)
├─ Version history of all edits
└─ References: documents, profiles (created_by)

collaborators (has many)
├─ Who has access & what role (owner/editor/viewer)
└─ Links: documents ↔ profiles

comments (has many)
├─ Threaded comments with resolve status
└─ Parent-child relationships for threads

active_users (has many)
├─ Real-time cursor positions & colors
└─ One per user per document

document_invitations (has many)
├─ Shareable invite links (token-based)
└─ Expires at optional, max uses optional
```

### Code Editor Tables (Same Structure)

```
code_documents → code_content, code_versions
             → code_collaborators, code_comments, code_active_users
```

---

## 🔑 Key Features

| Feature | Tables Used |
|---------|-------------|
| User Accounts | profiles |
| Document Ownership | documents, profiles |
| Real-time Collaboration | active_users |
| Sharing & Permissions | collaborators |
| Comments | comments |
| Version History | document_versions |
| Invite Links | document_invitations |
| Profile Pictures | storage.buckets |
| Premium Subscriptions | profiles (subscription_tier, expires_at) |
| Admin Controls | profiles (role field) |
| Code Collaboration | code_* tables (6 tables) |

---

## ✅ Verification Commands

### Check Tables Exist
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

### Check RLS Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Check Indexes
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

---

## 🔐 Security Overview

- **RLS Enabled**: All 14 tables have row-level security
- **Roles**: user, admin (first user auto-becomes admin)
- **Permissions**: owner/editor/viewer for documents
- **Access Control**: Users see only their documents + shared ones
- **Profile Privacy**: Users can only update their own profiles
- **Admin Access**: Admins can view all profiles
- **Storage**: Profile images secured by user folder

---

## 📊 Table Details Quick Reference

### profiles
```
id (UUID) → auth.users
username, email, role (user|admin)
avatar_url, subscription_tier (free|premium)
subscription_expires_at, created_at, updated_at
```

### documents
```
id, title, owner_id → profiles
created_at, updated_at, last_edited_by, last_edited_at
Unique: one owner, multiple collaborators
```

### collaborators
```
id, document_id, user_id → profiles
role (owner|editor|viewer), invited_by, created_at
Unique: (document_id, user_id)
```

### document_invitations
```
id, document_id, token (UNIQUE), role
created_by, status (pending|accepted|declined)
accepted_by, expires_at, max_uses, use_count
```

### comments
```
id, document_id, user_id, content
position_start, position_end, parent_id (threads)
resolved, created_at, updated_at
```

### active_users
```
id, document_id, user_id
cursor_position, cursor_color, last_seen
Unique: (document_id, user_id) - one per user per doc
```

### document_content
```
id, document_id (UNIQUE), content (JSONB)
version (integer), created_at, updated_at
Current version only (historical in document_versions)
```

### document_versions
```
id, document_id, content (JSONB), version
created_by, created_at
Full history of all edits
```

### code_documents
```
id, title, language, owner_id, created_at, updated_at
Similar structure to documents
```

### code_content
```
id, code_document_id, content (TEXT)
updated_by, updated_at
Current version only
```

### code_collaborators, code_comments, code_versions, code_active_users
```
Same pattern as document variants
```

---

## 🎯 Next Steps

1. **Run the schema** using CLI or SQL editor
2. **Verify tables** with provided SQL commands
3. **Create first user** - will auto-become admin
4. **Test features**:
   - Create a document
   - Add collaborator
   - Post a comment
   - Share with invite link
   - Create code document
5. **Check environment variables** in .env

---

## 📞 Support Resources

- **SQL Files**: Check comments in migration files
- **Errors**: Most are documented in existing migration comments
- **Performance**: All indexes automatically created
- **RLS Issues**: Check helper functions (is_admin, has_document_access, can_edit_document)

---

## 🚀 Performance Notes

- 24 indexes on frequently queried columns
- JSONB for flexible document content
- CASCADE deletes for referential integrity
- Cursor position updates are frequent - design for high volume
- Consider partitioning document_versions by date if large
- Profile picture storage uses bucket_id + user_id for security

---

**Status**: ✅ Complete schema ready for deployment

All files are in your project root:
- SUPABASE_COMPLETE_SCHEMA.sql
- SUPABASE_SETUP_COMMANDS.md
- SUPABASE_TABLES_COMPLETE.md
- DATABASE_SCHEMA_DIAGRAM.md
