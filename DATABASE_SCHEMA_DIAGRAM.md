# Database Schema Diagram & Relationships

## 📊 Complete Table Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DOCUMENT COLLABORATION SYSTEM                         │
└─────────────────────────────────────────────────────────────────────────────┘

AUTHENTICATION (Supabase Auth)
    ↓
    └─→ Trigger: handle_new_user()
        └─→ Creates profile on first login

┌──────────────────────────────────────────────────────────────────────────────┐
│ CORE TABLES                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤

profiles (User Accounts)
├─ id (UUID, PK)
├─ username (TEXT)
├─ email (TEXT)
├─ role (user_role: 'user' | 'admin')
├─ avatar_url (TEXT)
├─ subscription_tier ('free' | 'premium')
├─ subscription_expires_at (TIMESTAMPTZ)
├─ created_at (TIMESTAMPTZ)
└─ updated_at (TIMESTAMPTZ)
   ├─ FK: auth.users(id)
   └─ Indexed: created_at DESC, updated_at DESC

documents (Text Documents)
├─ id (UUID, PK)
├─ title (TEXT)
├─ owner_id (UUID, FK → profiles)
├─ created_at (TIMESTAMPTZ)
├─ updated_at (TIMESTAMPTZ)
├─ last_edited_by (UUID, FK → profiles)
└─ last_edited_at (TIMESTAMPTZ)
   └─ Indexed: owner_id, updated_at DESC

document_content (Document Content - Current)
├─ id (UUID, PK)
├─ document_id (UUID, FK → documents) [UNIQUE]
├─ content (JSONB)
├─ version (INTEGER)
├─ created_at (TIMESTAMPTZ)
└─ updated_at (TIMESTAMPTZ)
   └─ Indexed: document_id

document_versions (Document History)
├─ id (UUID, PK)
├─ document_id (UUID, FK → documents)
├─ content (JSONB)
├─ version (INTEGER)
├─ created_by (UUID, FK → profiles)
└─ created_at (TIMESTAMPTZ)
   └─ Indexed: document_id, version DESC

collaborators (Document Sharing)
├─ id (UUID, PK)
├─ document_id (UUID, FK → documents)
├─ user_id (UUID, FK → profiles)
├─ role (collaborator_role: 'owner'|'editor'|'viewer')
├─ invited_by (UUID, FK → profiles)
└─ created_at (TIMESTAMPTZ)
   ├─ Indexed: document_id, user_id
   └─ UNIQUE: (document_id, user_id)

comments (Threaded Comments)
├─ id (UUID, PK)
├─ document_id (UUID, FK → documents)
├─ user_id (UUID, FK → profiles)
├─ content (TEXT)
├─ position_start (INTEGER)
├─ position_end (INTEGER)
├─ parent_id (UUID, FK → comments) [Nullable - for threads]
├─ resolved (BOOLEAN, default: false)
├─ created_at (TIMESTAMPTZ)
└─ updated_at (TIMESTAMPTZ)
   └─ Indexed: document_id, parent_id

active_users (Real-time Presence)
├─ id (UUID, PK)
├─ document_id (UUID, FK → documents)
├─ user_id (UUID, FK → profiles)
├─ cursor_position (INTEGER)
├─ cursor_color (TEXT)
└─ last_seen (TIMESTAMPTZ)
   ├─ Indexed: document_id
   └─ UNIQUE: (document_id, user_id)

document_invitations (Shareable Links)
├─ id (UUID, PK)
├─ document_id (UUID, FK → documents)
├─ token (TEXT, UNIQUE)
├─ role (collaborator_role)
├─ created_by (UUID, FK → profiles)
├─ status (invitation_status: 'pending'|'accepted'|'declined')
├─ accepted_by (UUID, FK → profiles) [Nullable]
├─ created_at (TIMESTAMPTZ)
├─ expires_at (TIMESTAMPTZ) [Nullable]
├─ max_uses (INTEGER) [Nullable]
└─ use_count (INTEGER, default: 0)
   └─ Indexed: token, document_id, status

└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ CODE EDITOR TABLES (Same structure as documents)                             │
├──────────────────────────────────────────────────────────────────────────────┤

code_documents (Code Documents)
├─ id (UUID, PK)
├─ title (TEXT)
├─ language (TEXT, e.g., 'javascript')
├─ owner_id (UUID, FK → profiles)
├─ created_at (TIMESTAMPTZ)
└─ updated_at (TIMESTAMPTZ)
   └─ Indexed: owner_id

code_content (Code Content - Current)
├─ id (UUID, PK)
├─ code_document_id (UUID, FK → code_documents)
├─ content (TEXT)
├─ updated_by (UUID, FK → profiles)
└─ updated_at (TIMESTAMPTZ)
   └─ Indexed: code_document_id

code_collaborators (Code Sharing)
├─ id (UUID, PK)
├─ code_document_id (UUID, FK → code_documents)
├─ user_id (UUID, FK → profiles)
├─ role (TEXT: 'owner'|'editor'|'viewer')
└─ created_at (TIMESTAMPTZ)
   ├─ Indexed: code_document_id, user_id
   └─ UNIQUE: (code_document_id, user_id)

code_comments (Line Comments)
├─ id (UUID, PK)
├─ code_document_id (UUID, FK → code_documents)
├─ user_id (UUID, FK → profiles)
├─ content (TEXT)
├─ line_number (INTEGER)
├─ resolved (BOOLEAN, default: false)
├─ created_at (TIMESTAMPTZ)
└─ updated_at (TIMESTAMPTZ)
   └─ Indexed: code_document_id

code_versions (Code History)
├─ id (UUID, PK)
├─ code_document_id (UUID, FK → code_documents)
├─ content (TEXT)
├─ version_number (INTEGER)
├─ created_by (UUID, FK → profiles)
└─ created_at (TIMESTAMPTZ)
   └─ Indexed: code_document_id

code_active_users (Real-time Presence)
├─ id (UUID, PK)
├─ code_document_id (UUID, FK → code_documents)
├─ user_id (UUID, FK → profiles)
├─ cursor_position (INTEGER)
├─ color (TEXT)
└─ last_seen (TIMESTAMPTZ)
   ├─ Indexed: code_document_id
   └─ UNIQUE: (code_document_id, user_id)

└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ STORAGE (File Management)                                                    │
├──────────────────────────────────────────────────────────────────────────────┤

storage.buckets
└─ profile_images (PUBLIC)
   ├─ Path: {user_id}/profile_picture.*
   └─ Policies:
       ├─ Upload: Only own user_id folder
       ├─ Update: Only own user_id folder
       ├─ Delete: Only own user_id folder
       └─ Select: Public access

└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔗 Relationship Diagram

```
┌─────────┐
│ profiles│ (auth.users)
└────┬────┘
     │
     ├─────────────────┬─────────────────┬──────────────────┬──────────────────┐
     │                 │                 │                  │                  │
     ↓                 ↓                 ↓                  ↓                  ↓
┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐
│ documents   │  │  comments    │  │active_users  │  │collaborators │  │code_documents  │
│ (owner_id)  │  │ (user_id)    │  │ (user_id)    │  │ (user_id)    │  │ (owner_id)     │
└──────┬──────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────────┬───────┘
       │                │                 │                 │                  │
       ├────────────────┼─────────────────┼─────────────────┤                  │
       │                │                 │                 │                  │
       ↓                ↓                 ↓                 ↓                  ↓
┌──────────────────┐  ┌──────────────────┐  ┌────────────────────┐  ┌──────────────────┐
│document_content  │  │comments (parent) │  │document_invitations│  │code_content      │
│ (version 1)      │  │ (threaded)       │  │ (sharing links)    │  │ (current)        │
└──────────────────┘  └──────────────────┘  └────────────────────┘  └──────────────────┘
       │
       ↓
┌──────────────────┐
│document_versions │  (History)
│ (all versions)   │
└──────────────────┘
```

## 📋 Enum Types

```sql
-- user_role
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- collaborator_role
CREATE TYPE collaborator_role AS ENUM ('owner', 'editor', 'viewer');

-- invitation_status
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined');
```

## 🔐 Security Model

```
┌──────────────────────────────────────────────────────────────┐
│ Row Level Security (RLS) Enabled on All Tables              │
├──────────────────────────────────────────────────────────────┤
│ profiles                  → View own + admins full access    │
│ documents                 → Owner + collaborators only       │
│ document_content          → Access via has_document_access() │
│ collaborators             → Owner can manage                 │
│ comments                  → Read access to doc + creator only│
│ active_users              → Own presence only                │
│ document_invitations      → Public read, owner write         │
│ code_documents            → Owner + collaborators only       │
│ code_content              → Access via collaborators         │
│ code_collaborators        → Owner can manage                 │
│ code_comments             → Doc access required              │
│ code_versions             → Doc access required              │
│ code_active_users         → Own presence only                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Helper Functions (SQL Security Definer)                      │
├──────────────────────────────────────────────────────────────┤
│ is_admin(uid)              → Check if user is admin          │
│ has_document_access()      → Check read access to document   │
│ can_edit_document()        → Check edit access (owner/editor)│
└──────────────────────────────────────────────────────────────┘
```

## 📊 Table Count & Complexity

| Category | Count | Tables |
|----------|-------|--------|
| Core Documents | 8 | profiles, documents, document_content, collaborators, document_versions, comments, active_users, document_invitations |
| Code Editor | 6 | code_documents, code_content, code_collaborators, code_comments, code_versions, code_active_users |
| **Total** | **14** | All tables with RLS and indexes |

## 🚀 Performance Optimizations

- 24 indexes created for common queries
- UNIQUE constraints for document-user combinations
- Partial indexes on frequently filtered fields
- Foreign keys with CASCADE delete for data integrity
- JSONB storage for flexible editor content
- GIN indexes for full-text search potential

## ✅ Data Integrity

- Cascade delete: Deleting profile/document removes related records
- Foreign key constraints: No orphaned records
- Unique constraints: No duplicate document-user pairs
- Default values: Timestamps and status fields auto-populated
- Trigger function: Auto-create profile on auth signup

