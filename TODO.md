# Task: Build Real-Time Collaboration Web Application

## Plan
- [x] Step 1: Read key configuration files
  - [x] Read index.css for design tokens
  - [x] Read tailwind.config.js for theme configuration
  - [x] Read AuthContext.tsx for auth patterns
- [x] Step 2: Initialize Supabase and create database schema
  - [x] Initialize Supabase project
  - [x] Create profiles table with role enum
  - [x] Create documents table
  - [x] Create document_content table
  - [x] Create collaborators table with role enum
  - [x] Create document_versions table
  - [x] Create comments table
  - [x] Create active_users table for presence
  - [x] Set up RLS policies
  - [x] Create helper functions
  - [x] Set up auth trigger for profile sync
- [x] Step 3: Update design system
  - [x] Update index.css with collaboration app theme
  - [x] Ensure proper color tokens for light/dark mode
- [x] Step 4: Create types and database API
  - [x] Define TypeScript types matching database schema
  - [x] Create @/db/api.ts with all database operations
- [x] Step 5: Update auth system
  - [x] Update AuthContext.tsx for login/logout
  - [x] Update RouteGuard.tsx for route protection
  - [x] Update App.tsx with auth providers
- [x] Step 6: Create layout components
  - [x] Create AppLayout with sidebar navigation
- [x] Step 7: Create core pages
  - [x] Create Login page
  - [x] Create Dashboard page (document list)
  - [x] Create Editor page (main collaboration interface)
  - [x] Create Admin page (user management)
  - [x] Create Profile page
  - [x] Update routes.tsx
- [x] Step 8: Create editor components
  - [x] Create RichTextEditor component
  - [x] Create CollaboratorsSidebar component
  - [x] Create CommentsPanel component
  - [x] Create PresenceIndicator component
- [x] Step 9: Create document management components
  - [x] Create VersionHistoryDialog component
- [x] Step 10: Run lint and fix issues
  - [x] Fixed all TypeScript errors
  - [x] All lint checks passed
- [x] Step 11: Implement shareable invitation links
  - [x] Create document_invitations table
  - [x] Add invitation types to types.ts
  - [x] Create invitation API functions
  - [x] Create ShareDialog component
  - [x] Create InvitationPage component
  - [x] Update EditorPage with Share button
  - [x] Add invitation route
  - [x] Update RouteGuard for public invitation access
  - [x] Run lint and fix all issues

## Notes
- Using Supabase for backend (database + auth + real-time)
- Implementing polling for real-time updates (3-second intervals)
- Rich text editor built with contentEditable and custom formatting
- Role-based access: Owner, Editor, Viewer
- First registered user becomes admin
- Google OAuth uses SSO method as per requirements
- Username + password login (simulated with @miaoda.com domain)
- Auto-save functionality with 1-second debounce
- Version snapshots created every 10 edits
- Presence tracking updates every 5 seconds
- Active users shown with colored avatars
- Comments support threading and resolution
- Responsive design with resizable panels

## Shareable Invitation Links Feature
- Document owners can generate shareable invitation links
- Each link has configurable:
  - Access role (Editor or Viewer)
  - Expiration date (in days)
  - Maximum number of uses (optional)
- Links can be copied and shared with anyone
- Recipients can view invitation details before accepting
- Accept/Decline options for recipients
- Non-logged-in users are redirected to login, then back to invitation
- Invitation links are tracked and can be deleted by owner
- Active invitations displayed in ShareDialog with usage statistics


