# Step-by-Step: Building Your First .exe

This guide walks you through building the Windows executable from scratch.

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Node.js (should be 18+)
node --version

# Check pnpm (if not installed: npm install -g pnpm)
pnpm --version

# Check if you're in the right directory
pwd
# Should show: /workspace/app-8tgnyz6pnp4x
```

## Step 1: Install Dependencies (5 minutes)

```bash
cd /workspace/app-8tgnyz6pnp4x
pnpm install
```

**What this does**: Installs all required packages including Electron, React, and build tools.

**Expected output**: 
```
Progress: resolved XXX, reused XXX, downloaded XX, added XXX
Done in XXs
```

**If it fails**: 
- Check internet connection
- Try: `rm -rf node_modules && pnpm install`

## Step 2: Test in Development Mode (Optional, 2 minutes)

```bash
pnpm run electron:dev
```

**What this does**: Opens the app in a window with hot reload enabled.

**Expected result**: 
- Vite dev server starts on http://localhost:5173
- Electron window opens showing the app
- You can test all features

**To stop**: Press `Ctrl+C` in terminal

**If it fails**:
- Port 5173 might be in use: `lsof -ti:5173 | xargs kill -9`
- Try again: `pnpm run electron:dev`

## Step 3: Build the Executable (10-15 minutes)

### Option A: Build Installer (Recommended)

```bash
pnpm run electron:build
```

**What this does**:
1. Builds the React app (Vite)
2. Packages with Electron
3. Creates Windows installer

**Progress indicators**:
```
• building        target=nsis file=dist/builder-effective-config.yaml
• building        target=portable file=dist/builder-effective-config.yaml
• packaging       platform=win32 arch=x64 electron=XX.X.X
• building block map  blockMapFile=release\Real-Time Collaboration-1.0.0-x64.exe.blockmap
```

**Expected time**: 10-15 minutes (first build is slower)

**Output location**: 
```
release/Real-Time Collaboration-1.0.0-x64.exe
```

### Option B: Build Portable Version

```bash
pnpm run electron:build:portable
```

**Output location**:
```
release/Real-Time Collaboration-1.0.0-portable.exe
```

## Step 4: Locate Your .exe

```bash
# List all built files
ls -lh release/

# You should see:
# Real-Time Collaboration-1.0.0-x64.exe          (Installer)
# Real-Time Collaboration-1.0.0-portable.exe     (Portable)
# win-unpacked/                                   (Unpacked files)
```

## Step 5: Test the Executable

### Test Installer Version

```bash
# On Windows, double-click the file or run:
./release/Real-Time\ Collaboration-1.0.0-x64.exe
```

**Installation steps**:
1. Choose installation directory
2. Select shortcuts (Desktop, Start Menu)
3. Click Install
4. Launch the app

### Test Portable Version

```bash
# Simply run the portable exe:
./release/Real-Time\ Collaboration-1.0.0-portable.exe
```

**No installation needed** - just double-click and run!

## Step 6: Distribute

### Share the Installer

1. **Upload to cloud storage**:
   - Google Drive
   - Dropbox
   - OneDrive
   - Company server

2. **Share the link** with users

3. **Provide instructions**:
   - Download the .exe
   - Run the installer
   - Follow wizard steps

### Share the Portable Version

1. **Upload the portable .exe**
2. **Users can**:
   - Run directly from download folder
   - Copy to USB drive
   - Run without admin rights

## Troubleshooting

### Build Fails: "Cannot find module"

**Solution**:
```bash
rm -rf node_modules
pnpm install
pnpm run electron:build
```

### Build Fails: "ENOENT: no such file or directory"

**Solution**: Ensure you're in the correct directory
```bash
cd /workspace/app-8tgnyz6pnp4x
pwd  # Verify location
pnpm run electron:build
```

### Build Succeeds but .exe Won't Run

**Possible causes**:
1. **Antivirus blocking**: Add exception for the .exe
2. **Missing dependencies**: Install Visual C++ Redistributable
3. **Corrupted build**: Delete `release/` and rebuild

**Solution**:
```bash
rm -rf release dist
pnpm run electron:build
```

### .exe is Too Large (>300 MB)

**Normal size**: 150-200 MB
**If larger**: Check for unnecessary files in build

**Solution**: Clean build
```bash
rm -rf node_modules dist release
pnpm install
pnpm run electron:build
```

### Icon Not Showing

**Solution**: Convert SVG to ICO
1. Go to https://convertio.co/svg-ico/
2. Upload `build/icon.svg`
3. Download `icon.ico`
4. Save to `build/icon.ico`
5. Rebuild: `pnpm run electron:build`

### Windows Defender Flags the .exe

**Why**: Unsigned executables trigger warnings
**Solution**: 
1. **Short-term**: Click "More info" → "Run anyway"
2. **Long-term**: Get code signing certificate

## Advanced: Customization

### Change App Name

1. Edit `package.json`:
```json
{
  "name": "my-app",
  "productName": "My Awesome App"
}
```

2. Edit `electron-builder.json`:
```json
{
  "productName": "My Awesome App"
}
```

3. Rebuild: `pnpm run electron:build`

### Change App Icon

1. Create or download a 256x256 PNG icon
2. Convert to ICO format
3. Save as `build/icon.ico`
4. Rebuild: `pnpm run electron:build`

### Change App Version

1. Edit `package.json`:
```json
{
  "version": "2.0.0"
}
```

2. Rebuild: `pnpm run electron:build`
3. Output: `Real-Time Collaboration-2.0.0-x64.exe`

## Quick Reference

### All Build Commands

```bash
# Development (test app)
pnpm run electron:dev

# Build Windows installer
pnpm run electron:build

# Build Windows portable
pnpm run electron:build:portable

# Build all platforms (Windows, Mac, Linux)
pnpm run electron:build:all

# Clean build (if issues)
rm -rf node_modules dist release && pnpm install && pnpm run electron:build
```

### File Locations

```
Source code:        /workspace/app-8tgnyz6pnp4x/src/
Electron files:     /workspace/app-8tgnyz6pnp4x/electron/
Build config:       /workspace/app-8tgnyz6pnp4x/electron-builder.json
Built web app:      /workspace/app-8tgnyz6pnp4x/dist/
Built executables:  /workspace/app-8tgnyz6pnp4x/release/
```

### Build Times

| Task | Time |
|------|------|
| Install dependencies | 3-5 minutes |
| First build | 10-15 minutes |
| Subsequent builds | 5-10 minutes |
| Clean build | 15-20 minutes |

### File Sizes

| File | Size |
|------|------|
| Installer .exe | ~150-200 MB |
| Portable .exe | ~150-200 MB |
| Unpacked app | ~300-400 MB |

## Success Checklist

After building, verify:

- [ ] .exe file exists in `release/` directory
- [ ] File size is reasonable (150-200 MB)
- [ ] Double-clicking .exe opens the app
- [ ] Login/signup works
- [ ] Can create documents
- [ ] Can edit documents
- [ ] All formatting features work
- [ ] Can share documents
- [ ] Comments work
- [ ] Version history works

## Next Steps

1. **Test thoroughly** on a clean Windows machine
2. **Get feedback** from test users
3. **Consider code signing** for production
4. **Set up auto-updates** (optional)
5. **Create user documentation**
6. **Plan distribution strategy**

## Need Help?

- **Documentation**: Check BUILD_GUIDE.md
- **Quick Start**: See QUICK_START.md
- **Technical Details**: Read ELECTRON_CONVERSION.md
- **Issues**: Check troubleshooting section above

## Congratulations! 🎉

You've successfully built your first Windows executable!

**What you've accomplished**:
- ✅ Converted web app to desktop app
- ✅ Created Windows installer
- ✅ Created portable executable
- ✅ Ready for distribution

**Share your app** with the world! 🚀
