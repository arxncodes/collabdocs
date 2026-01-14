# Supabase Setup - Quick Commands

## 📋 Summary of All Tables

Your CollabDocs application requires **14 tables**:

### Documents & Collaboration (8 tables)
1. **profiles** - User accounts and profiles
2. **documents** - Rich text documents
3. **document_content** - Document content storage
4. **collaborators** - Document sharing/permissions
5. **document_versions** - Version history
6. **comments** - Threaded comments
7. **active_users** - Real-time presence tracking
8. **document_invitations** - Shareable invite links

### Code Editor (6 tables)
9. **code_documents** - Code editor documents
10. **code_content** - Code content storage
11. **code_collaborators** - Code document permissions
12. **code_comments** - Code line comments
13. **code_versions** - Code version history
14. **code_active_users** - Real-time presence in code editor

---

## 🚀 Setup Methods

### Method 1: Using Supabase CLI (Recommended)

```bash
# Navigate to your project directory
cd c:\Users\badbo\Downloads\collabdocs

# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_ID

# Push all migrations to your database
supabase db push

# Verify by listing tables
supabase db list
```

### Method 2: Using Supabase Dashboard (Manual)

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** → Create a new query
4. Copy the entire content from `SUPABASE_COMPLETE_SCHEMA.sql`
5. Paste into the query editor
6. Click **Run**

### Method 3: Using psql Command Line

```bash
# Install PostgreSQL client tools if needed
# Then run:

psql -h aws-0-us-east-1.pooler.supabase.com \
     -U postgres \
     -d postgres \
     -f SUPABASE_COMPLETE_SCHEMA.sql

# When prompted, enter your Supabase password
```

---

## ✅ Verification Checklist

### Check All Tables Exist

```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected output:
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

### Check RLS is Enabled

```sql
-- Should return 14 rows with relrowsecurity = true
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Check Indexes Created

```sql
-- Should show all indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;
```

---

## 🔑 Environment Variables

Update your `.env` file with Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: Supabase Dashboard → Settings → API

---

## 📝 Key Features

✅ **Authentication**: First user auto-becomes admin  
✅ **Role-Based Access**: owner/editor/viewer permissions  
✅ **Real-time Presence**: Cursor tracking with colors  
✅ **Version Control**: Full document history  
✅ **Comments**: Threaded comments with resolve status  
✅ **Invitations**: Shareable links with expiration & max uses  
✅ **Premium Features**: Subscription tier & expiration tracking  
✅ **Code Collaboration**: Separate code editor with same features  
✅ **RLS Security**: All tables have row-level security  
✅ **Storage**: Profile image bucket with public access  

---

## 🆘 Troubleshooting

### "Table already exists" error
- Don't run the schema twice
- Use `DROP TABLE IF EXISTS` (already included in the schema)

### Profile pictures not uploading
- Ensure storage bucket "profile_images" exists
- Check storage policies are created
- Verify correct bucket ID in code

### Authentication issues
- First user must exist to become admin
- Check `auth.users` table has entries
- Verify RLS policies allow authenticated access

### Performance issues
- All indexes are created automatically
- Queries should be fast with proper RLS policies
- Consider adding more indexes for custom queries

---

## 📚 File References

- **Setup Schema**: `SUPABASE_COMPLETE_SCHEMA.sql`
- **Documentation**: `SUPABASE_TABLES_COMPLETE.md`
- **Migrations Directory**: `supabase/migrations/`
- **Configuration**: `supabase/config.toml`

---

## 🎯 Next Steps After Setup

1. ✅ Run the schema setup
2. Create a test user account
3. Create a test document
4. Test document sharing with another user
5. Verify real-time features work
6. Test code editor collaboration
7. Check profile picture upload

---

## 💡 Tips

- The **profiles** table is auto-populated via Supabase auth trigger
- **document_content** uses JSONB for flexible editor content
- **active_users** updates are frequent - optimize queries if needed
- **Storage policies** use folder-based security (user_id/filename)
- All foreign keys cascade on delete for data integrity

---

**Questions?** Check the migration files in `supabase/migrations/` for detailed comments.
