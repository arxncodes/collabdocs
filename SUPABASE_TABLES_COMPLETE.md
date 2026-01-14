# Supabase Tables & Setup Guide

## Overview
This document outlines all the tables and profiles required for the CollabDocs application.

## Tables Summary

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **profiles** | User profiles & authentication | id, username, email, role, avatar_url, subscription_tier, subscription_expires_at |
| **documents** | Text documents | id, title, owner_id, created_at, updated_at, last_edited_by, last_edited_at |
| **document_content** | Document content storage | id, document_id, content (JSONB), version |
| **collaborators** | Document collaborators/sharing | id, document_id, user_id, role (owner/editor/viewer) |
| **document_versions** | Document version history | id, document_id, content, version, created_by |
| **comments** | Comments on documents | id, document_id, user_id, content, position_start, position_end, parent_id, resolved |
| **active_users** | Real-time presence tracking | id, document_id, user_id, cursor_position, cursor_color, last_seen |
| **document_invitations** | Shareable invite links | id, document_id, token, role, created_by, status, accepted_by, expires_at, max_uses |

### Code Collaboration Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **code_documents** | Code editor documents | id, title, language, owner_id, created_at, updated_at |
| **code_content** | Code content storage | id, code_document_id, content, updated_by, updated_at |
| **code_collaborators** | Code document collaborators | id, code_document_id, user_id, role |
| **code_comments** | Comments on code | id, code_document_id, user_id, content, line_number, resolved |
| **code_versions** | Code version history | id, code_document_id, content, version_number, created_by |
| **code_active_users** | Real-time presence in code editor | id, code_document_id, user_id, cursor_position, color, last_seen |

## Enums/Types

- **user_role**: 'user' | 'admin'
- **collaborator_role**: 'owner' | 'editor' | 'viewer'
- **invitation_status**: 'pending' | 'accepted' | 'declined'

## RLS Policies Included

All tables have Row Level Security (RLS) enabled with comprehensive policies for:
- Authentication checks
- Document ownership verification
- Collaborator role-based access
- Profile privacy controls
- Real-time presence tracking permissions

## Storage Buckets

- **profile_images**: Public bucket for storing user profile pictures

---

# Quick Setup: Single SQL Command

To create all tables and policies at once, use the complete SQL script below:

## Option 1: Copy-Paste the Complete Schema

See the file: **SUPABASE_COMPLETE_SCHEMA.sql** in the same directory.

## Option 2: Using Supabase CLI

```bash
# Initialize Supabase in your project
supabase init

# Apply all migrations
supabase db push

# This will run all SQL files in supabase/migrations/ in order
```

## Option 3: Manual SQL in Supabase Dashboard

1. Go to Supabase Dashboard → Your Project
2. Navigate to SQL Editor
3. Create a new query
4. Paste the entire content from **SUPABASE_COMPLETE_SCHEMA.sql**
5. Click "Run"

---

# Verification Checklist

After running the setup, verify all tables exist:

```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- [ ] profiles
- [ ] documents
- [ ] document_content
- [ ] collaborators
- [ ] document_versions
- [ ] comments
- [ ] active_users
- [ ] document_invitations
- [ ] code_documents
- [ ] code_content
- [ ] code_collaborators
- [ ] code_comments
- [ ] code_versions
- [ ] code_active_users

---

# Environment Variables

Make sure your `.env` file includes:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

# Notes

- **First User**: The first user to sign up will automatically get the 'admin' role
- **Premium Features**: Subscription tier and expiration are stored in profiles
- **Soft Delete**: Comments can be marked as 'resolved' instead of deleted
- **Versioning**: Full document and code version history is maintained
- **Presence**: Active users table tracks real-time cursor positions and colors
