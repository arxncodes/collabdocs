# Quick Start Guide - Windows Desktop App

## For Developers: Building the .exe

### Quick Build (3 Steps)

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Build Windows Executable**
   ```bash
   pnpm run electron:build
   ```

3. **Find Your .exe**
   ```
   release/Real-Time Collaboration-1.0.0-x64.exe
   ```

### Build Options

| Command | Output | Use Case |
|---------|--------|----------|
| `pnpm run electron:dev` | Development mode | Testing with hot reload |
| `pnpm run electron:build` | Installer .exe | Distribution to users |
| `pnpm run electron:build:portable` | Portable .exe | No-install version |

## For End Users: Installing the App

### Option 1: Installer Version (Recommended)

1. Download `Real-Time Collaboration-1.0.0-x64.exe`
2. Double-click the file
3. Follow the installation wizard
4. Launch from desktop shortcut

**Installed Location**: `C:\Users\[YourName]\AppData\Local\Real-Time Collaboration`

### Option 2: Portable Version

1. Download `Real-Time Collaboration-1.0.0-portable.exe`
2. Double-click to run
3. No installation needed!

**Perfect for**: USB drives, temporary use, no admin rights

## First Launch

### 1. Login/Register
- Click "Sign Up" to create an account
- Or "Login" if you already have one
- Use username + password

### 2. Create Your First Document
- Click "New Document" button
- Start typing!
- Auto-saves every second

### 3. Collaborate
- Click "Share" button
- Generate invitation link
- Share with team members
- See real-time edits!

## Key Features

### ✍️ Rich Text Editing
- **Fonts**: 10 professional fonts
- **Sizes**: 12px to 48px
- **Colors**: 30-color palette
- **Alignment**: Left, Center, Right, Justify
- **Layouts**: 8 pre-made templates

### 👥 Real-Time Collaboration
- See who's online
- Live cursor tracking
- Typing indicators
- Instant updates

### 🔗 Shareable Links
- Generate invitation links
- Set access roles (Editor/Viewer)
- Expiration dates
- Usage limits

### 💬 Comments
- Add inline comments
- Reply to discussions
- Resolve comments
- Track conversations

### 📜 Version History
- Auto-save every edit
- View previous versions
- Compare changes
- Restore any version

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New Document | Ctrl+N |
| Save | Ctrl+S (auto-saves) |
| Bold | Ctrl+B |
| Italic | Ctrl+I |
| Underline | Ctrl+U |
| Undo | Ctrl+Z |
| Redo | Ctrl+Y |
| Quit | Ctrl+Q |

## Menu Bar

### File Menu
- New Document (Ctrl+N)
- Exit (Ctrl+Q)

### Edit Menu
- Undo, Redo
- Cut, Copy, Paste
- Select All

### View Menu
- Reload
- Zoom In/Out
- Full Screen

### Window Menu
- Minimize
- Close

### Help Menu
- About
- Documentation

## Troubleshooting

### App Won't Start
1. Check Windows version (Windows 10+ required)
2. Run as Administrator
3. Check antivirus settings

### Can't Login
1. Check internet connection
2. Verify credentials
3. Try "Forgot Password"

### Documents Not Syncing
1. Check internet connection
2. Refresh the page (Ctrl+R)
3. Check Supabase status

### Slow Performance
1. Close unused documents
2. Clear browser cache
3. Restart the app

## System Requirements

**Minimum**:
- Windows 10 (64-bit)
- 4 GB RAM
- 500 MB free space
- Internet connection

**Recommended**:
- Windows 11 (64-bit)
- 8 GB RAM
- 1 GB free space
- Broadband internet

## Uninstallation

### Installer Version
1. Open Windows Settings
2. Go to Apps > Installed Apps
3. Find "Real-Time Collaboration"
4. Click Uninstall

### Portable Version
Simply delete the .exe file

## Updates

### Check for Updates
- Help > About
- Version number shown

### Install Updates
1. Download new version
2. Run installer
3. Overwrites old version

## Data & Privacy

### Where is Data Stored?
- Documents: Supabase cloud database
- Local cache: `%APPDATA%\Real-Time Collaboration`

### Offline Mode
- View cached documents
- Edit when offline
- Auto-sync when online

### Data Security
- Encrypted connections (HTTPS)
- Secure authentication
- Role-based access control

## Support

### Get Help
- Check documentation: BUILD_GUIDE.md
- Report issues: GitHub Issues
- Email support: support@example.com

### Common Questions

**Q: Is it free?**
A: Yes, the app is free to use.

**Q: How many users can collaborate?**
A: Unlimited collaborators per document.

**Q: Can I use it offline?**
A: View and edit cached documents offline. Syncs when online.

**Q: Is my data safe?**
A: Yes, all data is encrypted and stored securely.

**Q: Can I export documents?**
A: Yes, copy content or use browser print (Ctrl+P).

## Tips & Tricks

### 1. Keyboard Shortcuts
Master shortcuts for faster editing

### 2. Text Layouts
Use pre-made layouts for professional documents

### 3. Color Coding
Use colors to highlight important sections

### 4. Comments
Use comments for feedback instead of editing directly

### 5. Version History
Check version history before major changes

### 6. Shareable Links
Set expiration dates for temporary access

### 7. Roles
Use Viewer role for read-only access

### 8. Auto-Save
Don't worry about saving - it's automatic!

## What's Next?

### Explore Features
- Try all text formatting options
- Create a document with layouts
- Invite a colleague to collaborate
- Add comments and resolve them
- Check version history

### Customize
- Update your profile
- Set your avatar
- Configure preferences

### Collaborate
- Create a team workspace
- Share documents with team
- Use comments for feedback
- Track changes in version history

---

**Enjoy collaborating in real-time!** 🚀
