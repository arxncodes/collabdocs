# Real-Time Collaboration Web Application

A full-stack collaborative document editing application similar to Google Docs, built with React, TypeScript, Supabase, and shadcn/ui. Features real-time multi-user editing, live presence indicators, version history, and comprehensive document management.

## Features

### 🔐 Authentication
- **Username + Password**: Secure authentication with username/password
- **Google SSO**: Single Sign-On integration for Google accounts
- **Role-Based Access**: User and Admin roles with different permissions
- **Auto-Registration**: First user automatically becomes admin

### 📝 Document Management
- **Create & Edit**: Create new documents with rich text editing
- **Auto-Save**: Automatic saving with 1-second debounce
- **Delete Documents**: Owners can delete their documents
- **Document Dashboard**: View all your documents and shared documents
- **Search & Filter**: Organize and find documents easily

### 👥 Real-Time Collaboration
- **Multi-User Editing**: Multiple users can edit the same document simultaneously
- **Live Presence**: See who's currently viewing/editing the document
- **Cursor Tracking**: View other users' cursor positions with unique colors
- **User Avatars**: Active users displayed with colored avatars
- **Join/Leave Notifications**: Real-time updates when users join or leave

### ✍️ Rich Text Editor
- **Text Formatting**: Bold, italic, underline
- **Headings**: H1 and H2 support
- **Lists**: Bullet and numbered lists
- **Code Blocks**: Syntax highlighting for code
- **Keyboard Shortcuts**: Standard shortcuts (Ctrl+B, Ctrl+I, etc.)

### 🔄 Version History
- **Automatic Snapshots**: Version created every 10 edits
- **View History**: Browse all previous versions
- **Compare Versions**: See what changed between versions
- **Restore**: Revert to any previous version

### 💬 Commenting System
- **Inline Comments**: Add comments to specific text
- **Threaded Discussions**: Reply to comments
- **Resolve/Reopen**: Mark comments as resolved
- **Real-Time Updates**: See new comments instantly

### 🤝 Collaboration Features
- **Invite Users**: Share documents with other users
- **Role Management**: Assign roles (Owner, Editor, Viewer)
- **Access Control**: Fine-grained permissions
- **Remove Collaborators**: Owners can manage access

### 🎨 UI/UX
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: Polished user experience
- **Loading States**: Skeleton loaders for better UX
- **Toast Notifications**: Real-time feedback

### 👨‍💼 Admin Panel
- **User Management**: View all registered users
- **Role Assignment**: Change user roles
- **Statistics**: View user counts and metrics

## Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **shadcn/ui**: Beautiful UI components
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Modern icon library

### Backend
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Real-time capabilities

### Key Libraries
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **React Resizable Panels**: Resizable UI panels
- **Date-fns**: Date formatting

## Database Schema

### Tables
1. **profiles**: User profiles with roles
2. **documents**: Document metadata
3. **document_content**: Document content with versioning
4. **collaborators**: Document sharing and permissions
5. **document_versions**: Version history
6. **comments**: Comments and replies
7. **active_users**: Real-time presence tracking

### Security
- Row Level Security (RLS) enabled on all tables
- Helper functions for permission checks
- Secure authentication flow

## Getting Started

### Prerequisites
- Node.js 18+ installed
- pnpm package manager
- Supabase account (automatically configured)

### Installation

1. **Clone the repository**
   ```bash
   cd /workspace/app-8tgnyz6pnp4x
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Variables**
   The `.env` file is already configured with Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://jivvrysudelndpljdihf.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to the provided local URL

### First Time Setup

1. **Register First User**
   - Go to the login page
   - Click "Sign Up" tab
   - Create an account (first user becomes admin)

2. **Create a Document**
   - Navigate to Dashboard
   - Click "New Document"
   - Start editing!

3. **Invite Collaborators**
   - Open a document
   - Click "Share" button
   - Select users and assign roles

## Usage Guide

### Creating Documents
1. Click "New Document" on the dashboard
2. Enter a title (or use default "Untitled Document")
3. Start editing with the rich text editor

### Collaborating
1. Open a document you own
2. Click the "Share" button
3. Select a user from the dropdown
4. Choose their role (Editor or Viewer)
5. Click "Invite"

### Editing Documents
- **Bold**: Ctrl+B or click Bold button
- **Italic**: Ctrl+I or click Italic button
- **Underline**: Ctrl+U or click Underline button
- **Headings**: Click H1 or H2 buttons
- **Lists**: Click bullet or numbered list buttons
- **Code**: Click code block button

### Version History
1. Click "History" button in the editor
2. Browse versions in the left panel
3. Click a version to preview
4. Click "Restore" to revert to that version

### Comments
1. Click "Comments" button to open panel
2. Type your comment in the text area
3. Press Ctrl+Enter or click Send
4. Reply to comments by clicking "Reply"
5. Mark as resolved when done

### Admin Features
1. Navigate to Admin panel (admin users only)
2. View all registered users
3. Change user roles using the dropdown
4. Monitor user statistics

## Real-Time Features

### Polling System
The application uses polling for real-time updates:
- **Document updates**: Every 3 seconds
- **Presence tracking**: Every 5 seconds
- **Auto-save**: 1 second after typing stops

### Presence Indicators
- Active users shown with colored avatars
- Unique color assigned to each user
- Updates when users join/leave
- Cursor position tracking

### Conflict Resolution
- Last-write-wins strategy
- Auto-save prevents data loss
- Version history for recovery

## Security

### Authentication
- Secure password hashing
- JWT-based sessions
- Google SSO integration
- Email verification disabled for development

### Authorization
- Row Level Security (RLS) on all tables
- Role-based access control
- Document-level permissions
- Helper functions for permission checks

### Data Protection
- Encrypted connections
- Secure API endpoints
- Input validation
- XSS prevention

## Architecture

### Frontend Structure
```
src/
├── components/
│   ├── editor/          # Editor components
│   ├── layouts/         # Layout components
│   ├── ui/              # shadcn/ui components
│   └── common/          # Shared components
├── contexts/            # React contexts
├── db/                  # Database API layer
├── hooks/               # Custom hooks
├── pages/               # Page components
├── types/               # TypeScript types
└── lib/                 # Utilities
```

### Database Layer
- Centralized API in `@/db/api.ts`
- Type-safe operations
- Error handling
- Optimistic updates

### State Management
- React Context for auth
- Local state with useState
- Callbacks with useCallback
- Refs for intervals/timeouts

## Performance Optimizations

- **Debounced Auto-Save**: Reduces database writes
- **Polling Intervals**: Balanced real-time updates
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Prevents unnecessary re-renders
- **Optimistic Updates**: Instant UI feedback

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Known Limitations

1. **Real-Time Sync**: Uses polling instead of WebSockets
2. **Cursor Tracking**: Position-based, not selection-based
3. **Offline Mode**: Not supported
4. **File Attachments**: Not implemented
5. **Export**: PDF/DOCX export not available

## Future Enhancements

- [ ] WebSocket-based real-time sync
- [ ] Offline editing with sync
- [ ] Document export (PDF, DOCX)
- [ ] File attachments
- [ ] Advanced text formatting
- [ ] Mentions (@user)
- [ ] Activity log
- [ ] Email notifications
- [ ] Mobile apps
- [ ] AI assistant

## Troubleshooting

### Login Issues
- Ensure username contains only letters, numbers, and underscores
- Password must be at least 6 characters
- Check browser console for errors

### Document Not Loading
- Refresh the page
- Check your internet connection
- Verify you have access to the document

### Auto-Save Not Working
- Check if you have edit permissions
- Ensure you're not in viewer mode
- Look for error messages in the UI

### Presence Not Updating
- Refresh the page
- Check if polling is working (console logs)
- Verify active_users table permissions

## Contributing

This is a demonstration project. For production use, consider:
- Implementing proper WebSocket support
- Adding comprehensive error handling
- Implementing rate limiting
- Adding monitoring and analytics
- Writing unit and integration tests

## License

This project is created for demonstration purposes.

## Support

For issues or questions:
1. Check the browser console for errors
2. Review the database logs in Supabase
3. Verify RLS policies are correct
4. Check network requests in DevTools

## Acknowledgments

- Built with [React](https://react.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Note**: First user to register automatically becomes an administrator. Make sure to register your admin account first!
