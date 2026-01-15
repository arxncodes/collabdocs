# GitHub Pages Deployment Guide

## Overview
This project is now configured to deploy automatically to GitHub Pages using GitHub Actions.

## Setup Instructions

### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

### 2. Configure GitHub Pages Settings
1. Go to your GitHub repository
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - Select **Source**: "GitHub Actions"
   - The workflow will deploy from the `main` (or `master`) branch

### 3. Enable GitHub Actions
1. Go to **Actions** tab in your repository
2. Ensure GitHub Actions is enabled (you should see the workflow running)

## How It Works

### Automatic Deployment
- **Trigger**: Any push to `main` or `master` branch
- **Build**: Runs `pnpm install` and `pnpm build`
- **Deploy**: Automatically deploys the `dist` folder to GitHub Pages

### Workflow File
Location: `.github/workflows/deploy.yml`

The workflow:
1. Installs pnpm (npm package manager)
2. Sets up Node.js 18
3. Installs dependencies with locked versions
4. Builds the production bundle
5. Deploys to GitHub Pages

## Base Path Configuration

The app is configured to work in two scenarios:

### For Personal/Org GitHub Pages (username.github.io)
- Base path: `/`
- URL format: `https://username.github.io`

### For Project Repository Pages (collabdocs)
- Base path: `/collabdocs/`
- URL format: `https://username.github.io/collabdocs`

The workflow automatically sets the correct base path based on the GitHub Pages URL.

## Environment Variables

If you need to set environment variables for the build:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add your variables
4. Update `.github/workflows/deploy.yml` to use them with:
   ```yaml
   env:
       YOUR_VAR: ${{ secrets.YOUR_VAR }}
   ```

## Troubleshooting

### Deployment Failed
1. Check the **Actions** tab for error messages
2. Ensure `pnpm build` runs successfully locally:
   ```bash
   pnpm install
   pnpm build
   ```
3. Verify all dependencies are listed in `package.json`

### Pages Not Updating
1. Wait 2-3 minutes after push (GitHub needs time to deploy)
2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Check **Settings** → **Pages** for the live URL

### Asset 404 Errors
- Ensure all image/asset imports use relative paths
- The base path is automatically handled by Vite
- Test locally with: `pnpm build && pnpm preview`

## Local Testing

To test the build locally:
```bash
pnpm install
pnpm build
pnpm preview
```

Then visit `http://localhost:4173`

## Rollback

If something goes wrong:
1. Go to **Actions** tab
2. Find the failed deployment
3. You can manually revert by pushing to your branch

## Next Steps

1. **Verify deployment**: Go to your repository **Settings** → **Pages** to find your live URL
2. **Share**: Your site is now live at the URL shown in Pages settings
3. **Custom domain** (optional): Add a custom domain in Pages settings

## Notes

- The build artifacts are automatically cleaned before each build (`emptyOutDir: true`)
- Dependencies are cached for faster builds using pnpm's lockfile
- Only pushes to `main`/`master` trigger production deployments
- Pull requests build but don't deploy (useful for previewing changes)
