# Supabase Tables & Profiles - Complete Setup Guide

## 📋 Executive Summary

**Total Tables Needed**: 14  
**Profiles**: Automatic (Supabase Auth triggers profile creation)  
**Setup Time**: < 5 minutes  
**Files Created**: 6 documentation files + 1 complete schema SQL

---

## 🎯 What You Need to Create

### Document Collaboration (8 Tables)
```
profiles
├─ User accounts with role & premium status
└─ Auto-created from Supabase auth

documents + document_content + document_versions
├─ Rich text documents with full version history
└─ JSONB content storage

collaborators + document_invitations
├─ Share documents with permission control
└─ Invite links with expiration & usage limits

comments
├─ Threaded comments with resolve status
└─ Thread support with parent_id

active_users
├─ Real-time cursor tracking
└─ User presence with color coding
```

### Code Editor (6 Tables)
```
code_documents + code_content + code_versions
├─ Code documents with language support
└─ Full version history

code_collaborators + code_comments + code_active_users
├─ Same permission model as documents
└─ Line-based comments
```

---

## 🚀 How to Create Everything in One Go

### OPTION 1: Using Supabase CLI (Recommended)

```bash
# Step 1: Navigate to project
cd c:\Users\badbo\Downloads\collabdocs

# Step 2: Install Supabase CLI (if needed)
npm install -g supabase

# Step 3: Authenticate
supabase login

# Step 4: Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Step 5: Push all migrations
supabase db push
```

**This runs ALL migrations in order:**
- 00001_create_initial_schema.sql (8 tables)
- 00002_add_document_invitations.sql (invite links)
- 00003+ fixes and code tables
- add_code_collaboration.sql (6 code tables)

### OPTION 2: Single SQL Command (Dashboard)

1. Open Supabase Dashboard → Your Project
2. Click **SQL Editor** → **New Query**
3. Open file: `SUPABASE_COMPLETE_SCHEMA.sql`
4. Copy ALL content
5. Paste into SQL editor
6. Click **Run** ✅

**Result**: All 14 tables created instantly with:
- ✅ Proper constraints & indexes
- ✅ Row-level security policies
- ✅ Helper functions
- ✅ Storage bucket for profile images
- ✅ Auth trigger for profile sync

### OPTION 3: Using Individual Migrations

```bash
# If you want to run migrations manually
supabase db push --dry-run  # See what will be run
supabase db push             # Run all migrations
```

---

## 📊 Complete Table List

### Core Tables (Created by 00001_create_initial_schema.sql)

| Table | Columns | Purpose |
|-------|---------|---------|
| **profiles** | id, username, email, role, avatar_url, subscription_*, created_at, updated_at | User accounts with admin role & premium |
| **documents** | id, title, owner_id, created_at, updated_at, last_edited_by, last_edited_at | Rich text documents |
| **document_content** | id, document_id, content (JSONB), version, created_at, updated_at | Current document content |
| **collaborators** | id, document_id, user_id, role, invited_by, created_at | Document sharing with owner/editor/viewer roles |
| **document_versions** | id, document_id, content (JSONB), version, created_by, created_at | Full edit history |
| **comments** | id, document_id, user_id, content, position_*, parent_id, resolved, created_at, updated_at | Threaded comments |
| **active_users** | id, document_id, user_id, cursor_position, cursor_color, last_seen | Real-time presence |

### Invitations Table (Created by 00002_add_document_invitations.sql)

| Table | Columns | Purpose |
|-------|---------|---------|
| **document_invitations** | id, document_id, token, role, created_by, status, accepted_by, created_at, expires_at, max_uses, use_count | Shareable invite links |

### Code Collaboration Tables (Created by add_code_collaboration.sql)

| Table | Columns | Purpose |
|-------|---------|---------|
| **code_documents** | id, title, language, owner_id, created_at, updated_at | Code editor documents |
| **code_content** | id, code_document_id, content (TEXT), updated_by, updated_at | Current code content |
| **code_collaborators** | id, code_document_id, user_id, role, created_at | Code sharing permissions |
| **code_comments** | id, code_document_id, user_id, content, line_number, resolved, created_at, updated_at | Line-based comments |
| **code_versions** | id, code_document_id, content (TEXT), version_number, created_by, created_at | Code history |
| **code_active_users** | id, code_document_id, user_id, cursor_position, color, last_seen | Real-time code editor presence |

---

## 🔐 Profiles (Automatic)

**Profiles are automatically created** when users sign up through Supabase Auth!

The trigger function `handle_new_user()` does this:
1. User signs up → Supabase Auth creates entry in `auth.users`
2. After confirmation → Trigger fires
3. Auto-creates profile with:
   - id (from auth.users)
   - email (from auth signup)
   - username (derived from email)
   - role: 'admin' for first user, 'user' for others
   - created_at, updated_at timestamps

**Profile columns:**
```
id (UUID) → links to auth.users.id
username (TEXT)
email (TEXT)
role (user_role: 'user' | 'admin')
avatar_url (TEXT) → profile picture URL
subscription_tier ('free' | 'premium')
subscription_expires_at (TIMESTAMPTZ)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

---

## 📁 Generated Documentation

5 reference files have been created:

| File | Purpose | Length |
|------|---------|--------|
| **SUPABASE_COMPLETE_SCHEMA.sql** | Complete SQL to copy-paste | 750+ lines |
| **SUPABASE_ONE_COMMAND.md** | Quick single-command reference | Minimal |
| **SUPABASE_SETUP_COMMANDS.md** | All 3 setup methods | Detailed |
| **DATABASE_SCHEMA_DIAGRAM.md** | Visual diagrams & relationships | Comprehensive |
| **SUPABASE_TABLES_COMPLETE.md** | Complete table descriptions | Very detailed |

---

## ✅ Verification After Setup

Run these queries to verify everything worked:

### Count tables
```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Expected: 14
```

### List all tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

Expected:
```
active_users
code_active_users
code_collaborators
code_comments
code_content
code_documents
code_versions
collaborators
comments
document_content
document_invitations
document_versions
documents
profiles
```

### Verify RLS
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
-- Should list all 14 tables
```

### Check indexes
```sql
SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';
-- Expected: 24+ indexes
```

---

## 🎯 Environment Variables

After setup, configure your `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get from: Supabase Dashboard → Settings → API

---

## 🔒 Security Features Included

✅ **Row Level Security**: All 14 tables protected  
✅ **Role-based access**: owner/editor/viewer for documents  
✅ **Admin controls**: Admin role for first user  
✅ **User isolation**: Users see only their data  
✅ **Trigger security**: Profiles auto-created safely  
✅ **Storage security**: Profile images isolated by user_id  
✅ **Helper functions**: Centralized access checks  
✅ **Cascade deletes**: Referential integrity maintained  

---

## 🚀 Next Steps

1. ✅ Run setup (CLI or SQL dashboard)
2. ✅ Verify tables exist (run verification queries)
3. ✅ Configure .env with Supabase credentials
4. ✅ Test: Create user → Profile auto-creates
5. ✅ Test: Create document as owner
6. ✅ Test: Add collaborator
7. ✅ Test: Share with invite link

---

## 📞 Troubleshooting

**"Table already exists"**
- Schema has `IF NOT EXISTS`, safe to re-run
- Or use DROP TABLE first

**Profiles not appearing**
- Check `auth.users` table has entries
- Trigger only fires after email confirmation
- Check trigger: `SELECT * FROM auth.triggers;`

**RLS blocking access**
- Verify policies exist: `SELECT * FROM pg_policies;`
- Check user has authenticated role
- Test with admin user first

**Performance slow**
- All indexes auto-created
- Check index stats: `ANALYZE;`
- Consider partitioning large tables

---

## 📊 Statistics

- **Total Tables**: 14
- **Total Indexes**: 24+
- **Total Policies**: 50+
- **Enums**: 3 (user_role, collaborator_role, invitation_status)
- **Functions**: 4 (3 access + 1 trigger)
- **Storage Buckets**: 1 (profile_images)
- **Lines of SQL**: 750+

---

## ✨ Features Enabled by This Schema

✅ User authentication with role-based access  
✅ Real-time document collaboration  
✅ Full version history tracking  
✅ Threaded comments  
✅ Real-time cursor tracking  
✅ Shareable invite links with expiration  
✅ Document permissions (owner/editor/viewer)  
✅ Code collaboration with line comments  
✅ Premium subscription tracking  
✅ Admin user management  
✅ Profile picture storage  
✅ Automatic profile creation  
✅ Complete audit trail via versions  

---

**You're ready to go! Use Option 1, 2, or 3 above to set up everything in one shot.** 🚀
