# Code Collaboration Feature Documentation

## Overview

The Real-Time Collaboration App now includes a complete **Code Collaboration** feature that allows users to write, edit, and share code in multiple programming languages with real-time collaboration, syntax highlighting, and VS Code-like editing experience.

## Features

### 1. Multi-Language Support

**Supported Languages** (16 languages):
- JavaScript 🟨
- TypeScript 🔷
- Python 🐍
- Java ☕
- C++ ⚙️
- C# 🔷
- Go 🐹
- Rust 🦀
- PHP 🐘
- Ruby 💎
- Swift 🦅
- Kotlin 🟣
- HTML 🌐
- CSS 🎨
- SQL 🗄️
- Shell 🐚

### 2. Monaco Editor Integration

**VS Code Editor**:
- Same editor used in Visual Studio Code
- Professional syntax highlighting
- IntelliSense and auto-completion
- Bracket pair colorization
- Code folding
- Minimap navigation
- Line numbers
- Format on paste/type

**Editor Features**:
- Font: Fira Code, Cascadia Code, Consolas, Monaco (monospace with ligatures)
- Font size: 14px
- Tab size: 2 spaces
- Word wrap: Enabled
- Automatic layout adjustment
- Whitespace rendering on selection
- Indentation guides
- Bracket pair guides

### 3. Real-Time Collaboration

**Collaborative Features**:
- Multiple users can edit the same code simultaneously
- Live cursor tracking with unique colors per user
- Real-time presence indicators showing active users
- User join/leave notifications
- Auto-save every 2 seconds
- Manual save with Ctrl+S (Cmd+S on Mac)

**Presence System**:
- Shows avatars of active collaborators
- Color-coded user indicators
- Automatic presence updates every 5 seconds
- Inactive users removed after 5 minutes

### 4. Version Control

**Automatic Versioning**:
- Creates snapshot every 10 edits
- Version history accessible via History button
- View previous versions
- Compare different versions
- Restore any historical version

### 5. Save System

**Auto-Save**:
- Automatically saves after 2 seconds of inactivity
- Debounced to prevent excessive saves
- Toast notification on successful save
- Error notification with manual save prompt on failure

**Manual Save**:
- Save button in toolbar (highlighted when unsaved)
- Keyboard shortcut: Ctrl+S (Windows/Linux) or Cmd+S (Mac)
- Status indicators:
  - "Saving..." (gray + spinner)
  - "Unsaved changes" (amber)
  - "All changes saved" (green)

### 6. Code Management

**Dashboard Features**:
- Grid view of all code documents
- Language icons for quick identification
- Last updated timestamp
- Owner/Collaborator role indicator
- Create new code document
- Delete code document
- Quick navigation to editor

**Editor Features**:
- Title editing (inline)
- Language-specific syntax highlighting
- Dark/Light theme support
- Full-screen code editing
- Toolbar with quick actions

## User Interface

### Navigation

**Sidebar Menu**:
```
┌─────────────────────┐
│  CollabDocs         │
├─────────────────────┤
│  📄 My Documents    │
│  💻 My Codes        │ ← New!
│  👥 Admin (if admin)│
└─────────────────────┘
```

### Code Dashboard

**Layout**:
```
┌──────────────────────────────────────────────────────┐
│  💻 My Code Documents              [+ New Code]      │
│  Collaborate on code with syntax highlighting        │
├──────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐                │
│  │ 🟨 JS  │  │ 🐍 PY  │  │ ☕ JAVA│                │
│  │ Title  │  │ Title  │  │ Title  │                │
│  │ Owner  │  │ Editor │  │ Owner  │                │
│  │ 2h ago │  │ 1d ago │  │ 3d ago │                │
│  └────────┘  └────────┘  └────────┘                │
└──────────────────────────────────────────────────────┘
```

### Code Editor

**Layout**:
```
┌──────────────────────────────────────────────────────┐
│ [← Back] [Title] [Status] [👤] | [💾] [🕐] [💬] [👥]│
├──────────────────────────────────────────────────────┤
│  1 | function hello() {                              │
│  2 |   console.log("Hello, World!");                 │
│  3 | }                                                │
│  4 |                                                  │
│  5 |                                                  │
│    ...                                                │
│                                          [Minimap]    │
└──────────────────────────────────────────────────────┘
```

## Database Schema

### Tables

**code_documents**:
- `id`: UUID (primary key)
- `title`: TEXT (document title)
- `language`: TEXT (programming language)
- `owner_id`: UUID (references profiles)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

**code_content**:
- `id`: UUID (primary key)
- `code_document_id`: UUID (references code_documents)
- `content`: TEXT (code content)
- `updated_by`: UUID (references profiles)
- `updated_at`: TIMESTAMPTZ

**code_collaborators**:
- `id`: UUID (primary key)
- `code_document_id`: UUID (references code_documents)
- `user_id`: UUID (references profiles)
- `role`: TEXT (owner, editor, viewer)
- `created_at`: TIMESTAMPTZ

**code_comments**:
- `id`: UUID (primary key)
- `code_document_id`: UUID (references code_documents)
- `user_id`: UUID (references profiles)
- `content`: TEXT (comment text)
- `line_number`: INTEGER (line number in code)
- `resolved`: BOOLEAN
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

**code_versions**:
- `id`: UUID (primary key)
- `code_document_id`: UUID (references code_documents)
- `content`: TEXT (code snapshot)
- `version_number`: INTEGER
- `created_by`: UUID (references profiles)
- `created_at`: TIMESTAMPTZ

**code_active_users**:
- `id`: UUID (primary key)
- `code_document_id`: UUID (references code_documents)
- `user_id`: UUID (references profiles)
- `cursor_position`: INTEGER
- `color`: TEXT (user color)
- `last_seen`: TIMESTAMPTZ

## API Functions

### Code Documents
- `getCodeDocuments(userId)` - Get all code documents for user
- `getCodeDocument(codeDocumentId)` - Get single code document
- `createCodeDocument(title, language, ownerId)` - Create new code document
- `updateCodeDocument(codeDocumentId, updates)` - Update code document
- `deleteCodeDocument(codeDocumentId)` - Delete code document

### Code Content
- `getCodeContent(codeDocumentId)` - Get code content
- `updateCodeContent(codeDocumentId, content, userId)` - Update code content

### Collaborators
- `getCodeCollaborators(codeDocumentId)` - Get all collaborators
- `addCodeCollaborator(codeDocumentId, userId, role)` - Add collaborator
- `updateCodeCollaborator(collaboratorId, role)` - Update collaborator role
- `removeCodeCollaborator(collaboratorId)` - Remove collaborator

### Comments
- `getCodeComments(codeDocumentId)` - Get all comments
- `createCodeComment(codeDocumentId, userId, content, lineNumber)` - Create comment
- `updateCodeComment(commentId, content)` - Update comment
- `resolveCodeComment(commentId, resolved)` - Resolve/unresolve comment
- `deleteCodeComment(commentId)` - Delete comment

### Versions
- `getCodeVersions(codeDocumentId)` - Get version history
- `createCodeVersion(codeDocumentId, content, versionNumber, userId)` - Create version

### Presence
- `getCodeActiveUsers(codeDocumentId)` - Get active users
- `updateCodePresence(codeDocumentId, userId, cursorPosition, color)` - Update presence
- `removeCodePresence(codeDocumentId, userId)` - Remove presence

## Usage Guide

### Creating a Code Document

1. Click **"My Codes"** in the sidebar
2. Click **"+ New Code"** button
3. Enter a title (e.g., "API Server")
4. Select programming language (e.g., Python)
5. Click **"Create"**
6. Start coding!

### Editing Code

1. Navigate to **"My Codes"**
2. Click on a code document card
3. Editor opens with syntax highlighting
4. Start typing - auto-save handles saving
5. Use Ctrl+S for manual save
6. Watch status indicator for save confirmation

### Collaborating

1. Open a code document
2. Click **"Share"** button
3. Invite collaborators via email
4. Collaborators see live updates
5. See active users in presence indicator
6. Each user has unique cursor color

### Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Save | Ctrl+S | Cmd+S |
| Find | Ctrl+F | Cmd+F |
| Replace | Ctrl+H | Cmd+H |
| Go to Line | Ctrl+G | Cmd+G |
| Comment Line | Ctrl+/ | Cmd+/ |
| Format Code | Shift+Alt+F | Shift+Option+F |

## Technical Implementation

### Monaco Editor Configuration

```typescript
<Editor
  height="100%"
  language={codeDocument.language}
  value={currentContent}
  onChange={handleContentChange}
  theme={theme === 'dark' ? 'vs-dark' : 'light'}
  options={{
    fontSize: 14,
    fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', 'Monaco', monospace",
    fontLigatures: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    formatOnPaste: true,
    formatOnType: true,
    lineNumbers: 'on',
    renderWhitespace: 'selection',
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      indentation: true,
    },
  }}
/>
```

### Auto-Save Implementation

```typescript
const handleContentChange = useCallback(
  (value: string | undefined) => {
    if (!codeDocumentId || !user || value === undefined) return;

    setCurrentContent(value);
    setHasUnsavedChanges(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      await updateCodeContent(codeDocumentId, value, user.id);
      setHasUnsavedChanges(false);
      
      // Version snapshot every 10 edits
      editCountRef.current += 1;
      if (editCountRef.current >= 10) {
        editCountRef.current = 0;
        lastVersionRef.current += 1;
        await createCodeVersion(codeDocumentId, value, lastVersionRef.current, user.id);
      }
    }, 2000);
  },
  [codeDocumentId, user]
);
```

### Presence Tracking

```typescript
// Update presence every 5 seconds
presenceIntervalRef.current = setInterval(() => {
  if (codeDocumentId && user) {
    updateCodePresence(codeDocumentId, user.id, cursorPosition, userColor);
    loadActiveUsers();
  }
}, 5000);

// Track cursor position
editor.onDidChangeCursorPosition((e: any) => {
  const position = e.position;
  const offset = editor.getModel()?.getOffsetAt(position) || 0;
  setCursorPosition(offset);
});
```

## Security

### Row Level Security (RLS)

**Policies**:
- Users can only view code documents they own or collaborate on
- Only owners can delete code documents
- Editors can modify content
- Viewers can only read
- Comments require collaboration access
- Presence updates require authentication

### Access Control

**Roles**:
- **Owner**: Full control (edit, delete, manage collaborators)
- **Editor**: Can edit code and add comments
- **Viewer**: Read-only access

## Performance

### Optimization Strategies

1. **Debounced Auto-Save**: Prevents excessive database writes
2. **Polling Interval**: 3 seconds for real-time updates
3. **Presence Cleanup**: Removes inactive users after 5 minutes
4. **Efficient Queries**: Indexed database queries
5. **Lazy Loading**: Monaco Editor loaded on demand
6. **Minimap**: Optional for better navigation

### Network Usage

- **Auto-save**: Every 2 seconds (when editing)
- **Presence updates**: Every 5 seconds
- **Polling**: Every 3 seconds
- **Version snapshots**: Every 10 edits

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Edge - Full support
- ✅ Firefox - Full support
- ✅ Safari - Full support
- ✅ Opera - Full support

### Monaco Editor Requirements
- Modern browser with ES6 support
- JavaScript enabled
- Minimum 1280x720 resolution recommended

## Troubleshooting

### Editor Not Loading

**Symptoms**:
- Blank editor area
- Loading spinner indefinitely

**Solutions**:
1. Check internet connection
2. Clear browser cache
3. Disable browser extensions
4. Try different browser
5. Check console for errors

### Syntax Highlighting Not Working

**Symptoms**:
- Code appears as plain text
- No color highlighting

**Solutions**:
1. Verify language is supported
2. Check Monaco Editor loaded
3. Refresh the page
4. Try different language
5. Check browser console

### Auto-Save Not Working

**Symptoms**:
- Status stays "Unsaved changes"
- Changes lost on refresh

**Solutions**:
1. Check internet connection
2. Try manual save (Ctrl+S)
3. Check browser console
4. Verify you have edit permissions
5. Refresh and try again

### Collaborators Not Visible

**Symptoms**:
- No presence indicators
- Can't see other users

**Solutions**:
1. Check internet connection
2. Verify collaborators are active
3. Refresh the page
4. Check presence polling
5. Verify database connection

## Future Enhancements

Planned features:
- [ ] Code execution (run code in browser)
- [ ] Integrated terminal
- [ ] Git integration
- [ ] Code review tools
- [ ] Diff viewer
- [ ] Search across files
- [ ] Multi-file projects
- [ ] Code snippets library
- [ ] AI code completion
- [ ] Collaborative debugging

## Summary

**Key Features**:
- ✅ 16 programming languages supported
- ✅ Monaco Editor (VS Code editor)
- ✅ Real-time collaboration
- ✅ Syntax highlighting
- ✅ Auto-save and manual save
- ✅ Version control
- ✅ Presence indicators
- ✅ Comments system
- ✅ Dark/Light themes
- ✅ Keyboard shortcuts

**Benefits**:
- Professional code editing experience
- Real-time collaboration like Google Docs
- Never lose work with auto-save
- Track changes with version history
- Collaborate with team members
- Support for multiple languages

---

**Happy Coding!** 💻✨
