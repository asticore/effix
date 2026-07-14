# Setting Up GitHub for EFFIX

Follow these steps to push your EFFIX project to GitHub and make it public.

## Step 1: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `effix`
3. **Description:** `CSS Effects Framework - Bootstrap-like class-based animations`
4. **Visibility:** Public (to share it as open source)
5. **Initialize this repository with:**
   - ❌ Do NOT check "Add a README file" (we have one)
   - ❌ Do NOT check ".gitignore" (we have one)
   - ✅ Check "Choose a license" → Select "MIT License"
6. Click "Create repository"

## Step 2: Set Up Git Locally

Open your terminal/command prompt and navigate to the project:

```bash
cd C:\Users\matth\Claude\Projects\effix
```

### Configure Git (if not already done)

```bash
git config --global user.name "Matt Peterman"
git config --global user.email "matthewpeterman92@gmail.com"
```

### Initialize Git Repository

```bash
# Check if git is already initialized
git status

# If not initialized, initialize it
git init

# Verify git is working
git status
```

### Add Files and Commit

```bash
# Add all files
git add .

# Commit initial files
git commit -m "Initial commit: EFFIX CSS effects framework"

# Verify the commit
git log
```

## Step 3: Connect to GitHub and Push

After creating the repository on GitHub, you'll see instructions. Follow them:

```bash
# Add GitHub remote (replace YOUR-USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/effix.git

# Rename branch to main (GitHub default)
git branch -M main

# Push to GitHub
git push -u origin main
```

### What to Replace
- Replace `YOUR-USERNAME` with your actual GitHub username
- For example: `https://github.com/mattsmith/effix.git`

### If You Get Authentication Errors

**Using HTTPS (simpler for beginners):**
1. Create a Personal Access Token on GitHub:
   - Go to Settings → Developer settings → Personal access tokens
   - Click "Generate new token"
   - Give it a name like "EFFIX Setup"
   - Select scopes: `repo`, `workflow`, `write:packages`
   - Copy the token
2. When asked for password during `git push`, paste the token instead

**Using SSH (more secure):**
1. Follow [GitHub's SSH setup guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
2. Use SSH URL: `git@github.com:YOUR-USERNAME/effix.git`

## Step 4: Verify It's Public

1. Go to `https://github.com/YOUR-USERNAME/effix`
2. Click on **Settings** (right side)
3. Scroll to "Danger Zone" → **Make this repository public** (if not already)
4. Click "Make public" and confirm

## Step 5: Update Links in Files

After pushing to GitHub, update these files with your actual GitHub username:

### In `README.md`:
Find and replace:
- `yourusername` → your GitHub username
- `https://github.com/yourusername/effix` → your repo URL

Example:
```markdown
# Before
[GitHub](https://github.com/yourusername/effix)

# After
[GitHub](https://github.com/mattsmith/effix)
```

### In `docs/QUICK-START.md`:
Update NPM installation if you plan to publish to npm:
```bash
npm install effix
```

## Step 6: Final Push

After updating links:

```bash
git add .
git commit -m "docs: update GitHub links"
git push
```

## Verify Everything

1. ✅ Repository is on GitHub: `https://github.com/YOUR-USERNAME/effix`
2. ✅ Repository is PUBLIC
3. ✅ README.md is visible on repo home
4. ✅ All files are in the repo
5. ✅ License is MIT
6. ✅ Contributing guide is visible

## Optional: Add GitHub Topics

On your repo's main page:
1. Click **Add topics**
2. Add: `css-animations`, `effects`, `bootstrap-like`, `animation-library`, `open-source`

## Optional: Create Releases

```bash
# Create a git tag for v1.0.0
git tag -a v1.0.0 -m "Version 1.0.0 - Initial Release"

# Push the tag to GitHub
git push origin v1.0.0

# On GitHub: Releases → "Create a new release" → Select tag v1.0.0
# Add release notes and files
```

## Quick Command Summary

```bash
# Setup
cd C:\Users\matth\Claude\Projects\effix
git config --global user.name "Matt Peterman"
git config --global user.email "matthewpeterman92@gmail.com"
git init

# Commit locally
git add .
git commit -m "Initial commit: EFFIX CSS effects framework"

# Connect to GitHub (after creating repo on GitHub)
git remote add origin https://github.com/YOUR-USERNAME/effix.git
git branch -M main
git push -u origin main

# Update and push again
git add .
git commit -m "docs: update GitHub links"
git push
```

## Troubleshooting

### "fatal: not a git repository"
```bash
git init
git config user.email "matthewpeterman92@gmail.com"
git config user.name "Matt Peterman"
```

### "Permission denied (publickey)"
Use HTTPS instead of SSH, or set up SSH keys:
https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### "Repository not found"
- Double-check your username is correct
- Make sure you created the repo on GitHub first
- Check that you're using the right remote URL

### "Updates were rejected because the tip of your current branch is behind"
```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

## Next Steps

1. ✅ Set up GitHub repo
2. ✅ Push EFFIX to GitHub
3. Make the repo public
4. Share the repo link in your projects/portfolio
5. (Optional) Publish to npm for easier installation
6. (Optional) Set up GitHub Pages for documentation

## Documentation Links

- [GitHub Quickstart](https://docs.github.com/en/get-started/quickstart)
- [Managing Remotes](https://docs.github.com/en/get-started/getting-started-with-git/managing-remote-repositories)
- [Making a Repository Public](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)

---

**Need help?** Open an issue on GitHub or check the [CONTRIBUTING.md](CONTRIBUTING.md) guide.
