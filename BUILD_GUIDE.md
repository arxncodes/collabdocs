# Building Windows Executable (.exe)

This guide explains how to build the Real-Time Collaboration App as a Windows desktop application.

## Prerequisites

### Required Software
1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **pnpm** (Package Manager)
   - Install: `npm install -g pnpm`
   - Verify: `pnpm --version`

3. **Windows Build Tools** (for Windows)
   - Automatically installed with Node.js on Windows
   - Or install manually: `npm install -g windows-build-tools`

### Optional (for icon conversion)
- **ImageMagick** or **GIMP** to convert SVG to ICO format
- Online converter: https://convertio.co/svg-ico/

## Setup Instructions

### 1. Install Dependencies

```bash
cd /workspace/app-8tgnyz6pnp4x
pnpm install
```

This will install all required dependencies including:
- Electron
- electron-builder
- All React and UI dependencies

### 2. Prepare Application Icon

#### Option A: Use Existing Icon
If you have a `.ico` file (256x256 or 512x512):
```bash
cp your-icon.ico build/icon.ico
```

#### Option B: Convert SVG to ICO
1. Use an online converter: https://convertio.co/svg-ico/
2. Upload `build/icon.svg`
3. Download the converted `icon.ico`
4. Place it in `build/icon.ico`

#### Option C: Use Default Icon
The build will use Electron's default icon if none is provided.

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_ID=your_app_id
VITE_API_ENV=production
```

## Build Commands

### Development Mode (Test Electron App)

Run the app in development mode with hot reload:

```bash
pnpm run electron:dev
```

This will:
1. Start Vite dev server on http://localhost:5173
2. Launch Electron window
3. Enable hot module replacement
4. Open DevTools for debugging

**Note**: Press `Ctrl+R` to reload, `Ctrl+Shift+I` to toggle DevTools

### Production Build (Create .exe)

#### Build Installer (.exe)

Creates a Windows installer with setup wizard:

```bash
pnpm run electron:build
```

Output location: `release/Real-Time Collaboration-1.0.0-x64.exe`

**Features**:
- Installation wizard
- Desktop shortcut creation
- Start menu entry
- Uninstaller
- File size: ~150-200 MB

#### Build Portable Version

Creates a standalone executable (no installation required):

```bash
pnpm run electron:build:portable
```

Output location: `release/Real-Time Collaboration-1.0.0-portable.exe`

**Features**:
- No installation needed
- Run from USB drive
- Single executable file
- File size: ~150-200 MB

#### Build All Platforms

Build for Windows, macOS, and Linux:

```bash
pnpm run electron:build:all
```

**Note**: Building for macOS requires a Mac computer. Building for Linux works on any platform.

## Build Output

After successful build, you'll find the executables in the `release/` directory:

```
release/
├── Real-Time Collaboration-1.0.0-x64.exe          # Installer
├── Real-Time Collaboration-1.0.0-portable.exe     # Portable
└── win-unpacked/                                   # Unpacked files
    └── Real-Time Collaboration.exe                 # Direct executable
```

## Distribution

### Installer Version (.exe)
**Best for**: General users, corporate deployment

**How to distribute**:
1. Share the installer `.exe` file
2. Users run the installer
3. App is installed to `C:\Users\[Username]\AppData\Local\Real-Time Collaboration`
4. Desktop and Start Menu shortcuts created

**Installation steps for users**:
1. Double-click the `.exe` file
2. Follow installation wizard
3. Choose installation directory (optional)
4. Click "Install"
5. Launch from desktop shortcut

### Portable Version
**Best for**: USB drives, no-install scenarios

**How to distribute**:
1. Share the portable `.exe` file
2. Users can run directly without installation
3. No admin rights required

**Usage for users**:
1. Download the portable `.exe`
2. Double-click to run
3. No installation needed

## Customization

### Change App Name

Edit `electron-builder.json`:
```json
{
  "productName": "Your App Name",
  "appId": "com.yourcompany.yourapp"
}
```

### Change App Version

Edit `package.json`:
```json
{
  "version": "1.0.0"
}
```

### Change App Icon

Replace `build/icon.ico` with your custom icon:
- Recommended size: 256x256 or 512x512
- Format: .ico (Windows)
- Use multiple resolutions in one .ico file for best results

### Customize Installer

Edit `electron-builder.json` under `nsis` section:
```json
{
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "installerIcon": "build/icon.ico",
    "license": "LICENSE.txt"
  }
}
```

### Add Auto-Update

1. Set up a release server
2. Configure `publish` in `electron-builder.json`:
```json
{
  "publish": {
    "provider": "github",
    "owner": "yourusername",
    "repo": "yourrepo"
  }
}
```

## Troubleshooting

### Build Fails with "Cannot find module"

**Solution**: Reinstall dependencies
```bash
rm -rf node_modules
pnpm install
```

### Icon Not Showing

**Solution**: Ensure icon.ico is in correct location
```bash
ls build/icon.ico
```

If missing, create or copy icon file to `build/icon.ico`

### App Window is Blank

**Solution**: Check base path in vite.config.ts
```typescript
export default defineConfig({
  base: './',  // Must be './' for Electron
});
```

### Build is Too Large

**Solution**: Optimize build size

1. Remove unused dependencies
2. Enable compression in electron-builder.json:
```json
{
  "compression": "maximum"
}
```

### Antivirus Blocks the .exe

**Solution**: Code signing (requires certificate)

1. Obtain code signing certificate
2. Configure in electron-builder.json:
```json
{
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "password"
  }
}
```

**Alternative**: Submit to antivirus vendors for whitelisting

### App Crashes on Startup

**Solution**: Check console logs

1. Run in development mode: `pnpm run electron:dev`
2. Check DevTools console for errors
3. Verify environment variables are set

## Advanced Configuration

### Custom Window Size

Edit `electron/main.js`:
```javascript
mainWindow = new BrowserWindow({
  width: 1600,      // Change width
  height: 1000,     // Change height
  minWidth: 1024,   // Minimum width
  minHeight: 768,   // Minimum height
});
```

### Disable DevTools in Production

Edit `electron/main.js`:
```javascript
if (isDev) {
  mainWindow.webContents.openDevTools();
}
// Remove or comment out the line above for production
```

### Add Custom Menu Items

Edit `electron/main.js` in the `template` array:
```javascript
{
  label: 'Custom',
  submenu: [
    {
      label: 'Custom Action',
      click: () => {
        // Your custom action
      }
    }
  ]
}
```

## Performance Optimization

### Reduce Bundle Size

1. **Tree Shaking**: Vite automatically removes unused code
2. **Code Splitting**: Lazy load routes
3. **Compression**: Enable in electron-builder

### Improve Startup Time

1. **Preload Critical Resources**: Use preload script
2. **Lazy Load Components**: Use React.lazy()
3. **Optimize Images**: Compress images before bundling

### Memory Optimization

1. **Limit Concurrent Processes**: Configure in main.js
2. **Clear Cache**: Implement cache clearing
3. **Monitor Memory**: Use Chrome DevTools

## Security Best Practices

### 1. Context Isolation
Already enabled in `electron/main.js`:
```javascript
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
}
```

### 2. Content Security Policy
Add to index.html:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">
```

### 3. Secure External Links
Already implemented in `electron/main.js`:
```javascript
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  shell.openExternal(url);
  return { action: 'deny' };
});
```

## Deployment Checklist

- [ ] Update version number in package.json
- [ ] Update app name and description
- [ ] Add custom icon (icon.ico)
- [ ] Set environment variables
- [ ] Test in development mode
- [ ] Build production executable
- [ ] Test installation on clean Windows machine
- [ ] Test portable version
- [ ] Verify all features work offline
- [ ] Check file size (should be < 250 MB)
- [ ] Scan with antivirus
- [ ] Create user documentation
- [ ] Prepare distribution method

## Support

### Common Issues

1. **App won't start**: Check Windows Event Viewer for errors
2. **Features not working**: Verify internet connection for Supabase
3. **Slow performance**: Check system requirements
4. **Update issues**: Clear app cache and reinstall

### System Requirements

**Minimum**:
- Windows 10 (64-bit)
- 4 GB RAM
- 500 MB disk space
- Internet connection (for collaboration features)

**Recommended**:
- Windows 11 (64-bit)
- 8 GB RAM
- 1 GB disk space
- Broadband internet connection

## Additional Resources

- **Electron Documentation**: https://www.electronjs.org/docs
- **electron-builder**: https://www.electron.build/
- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/

## License

This application is licensed under the MIT License. See LICENSE.txt for details.

---

**Need Help?** Open an issue on GitHub or contact support.
