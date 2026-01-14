# 🚀 Supabase Setup - Single Command

## The Easiest Way

Copy and run this **ONE command** to set up everything:

### If using Supabase CLI:
```bash
cd c:\Users\badbo\Downloads\collabdocs && supabase db push
```

### If not using CLI (Manual in Supabase Dashboard):

1. Open: https://app.supabase.com → Your Project
2. Go to: **SQL Editor**
3. Click: **New Query**
4. Paste the complete SQL from: **`SUPABASE_COMPLETE_SCHEMA.sql`**
5. Click: **Run**

---

## What Gets Created

✅ **14 Tables**
- 8 Document collaboration tables
- 6 Code editor tables

✅ **24 Indexes** (for performance)

✅ **50+ RLS Policies** (for security)

✅ **3 Helper Functions** (for access control)

✅ **1 Storage Bucket** (for profile images)

✅ **3 Enums** (user_role, collaborator_role, invitation_status)

---

## All 14 Tables Created

| # | Table Name | Type |
|---|---|---|
| 1 | profiles | Users & Accounts |
| 2 | documents | Text Documents |
| 3 | document_content | Current Content |
| 4 | collaborators | Sharing & Permissions |
| 5 | document_versions | Version History |
| 6 | comments | Comments |
| 7 | active_users | Real-time Presence |
| 8 | document_invitations | Invite Links |
| 9 | code_documents | Code Documents |
| 10 | code_content | Code Content |
| 11 | code_collaborators | Code Permissions |
| 12 | code_comments | Code Comments |
| 13 | code_versions | Code History |
| 14 | code_active_users | Code Presence |

---

## Verification (Run These Queries After Setup)

### See all 14 tables:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

### Confirm table count:
```sql
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Should return: 14
```

### Check RLS is enabled on all:
```sql
SELECT COUNT(*) as rls_enabled_tables
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
-- Should return: 14
```

---

## Related Documentation

| File | Contains |
|------|----------|
| SUPABASE_COMPLETE_SCHEMA.sql | Full SQL (copy & paste into dashboard) |
| SUPABASE_SETUP_COMMANDS.md | Detailed setup methods & troubleshooting |
| DATABASE_SCHEMA_DIAGRAM.md | Visual diagrams & relationships |
| SUPABASE_TABLES_COMPLETE.md | Complete table descriptions |
| SETUP_REFERENCE.md | Quick reference guide |

---

## Environment Setup

After running the schema, add to your `.env` file:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from Supabase Dashboard → Settings → API

---

## ✅ You're Done!

Your database is ready for:
- ✅ User authentication
- ✅ Document collaboration
- ✅ Real-time features
- ✅ Version control
- ✅ Comments & threads
- ✅ Code sharing
- ✅ Admin controls
- ✅ Premium subscriptions

---

**Questions?** Check the detailed documentation files in the project root.
