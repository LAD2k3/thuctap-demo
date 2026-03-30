# How the Workspace Setup Works

## The Problem We're Solving

You want to:
1. ✅ Share code between template projects (like the Tutorial Viewer component)
2. ✅ Let developers work directly in their game folder (`cd group-sort && yarn dev`)
3. ✅ No automatic builds - each developer controls when to build
4. ✅ Work after cloning: minimal setup required

## The Solution: Yarn Workspaces

**Yarn Workspaces** allow multiple projects to share dependencies and code while remaining independently developable.

---

## How It Works

### Folder Structure

```
template-projects/
├── package.json               # Workspace root configuration
├── .yarnrc.yml                # Yarn settings
│
├── shared/                    # Shared library packages
│   └── tutorial-viewer/
│       └── package.json       # Name: @minigame/tutorial-viewer
│
├── group-sort/                # Game template
│   └── package.json           # Name: group-sort
│
└── [other games...]
```

### Root `package.json`

```json
{
  "name": "minigame-templates",
  "private": true,
  "workspaces": [
    "shared/*",
    "group-sort",
    "balloon-letter-picker",
    "labelled-diagram",
    "pair-matching",
    "plane-quiz",
    "whack-a-mole",
    "word-search"
  ]
}
```

The `workspaces` array tells Yarn:
- "These folders are part of the workspace"
- "Hoist shared dependencies to root `node_modules`"
- "Enable cross-package imports"

### Workspace Package Reference

In your game's `package.json`:

```json
{
  "name": "group-sort",
  "dependencies": {
    "@minigame/tutorial-viewer": "workspace:*"
  }
}
```

The `workspace:*` protocol tells Yarn:
- "Don't download from npm"
- "Use the local package in the workspace"
- "Link it via symlinks"

---

## What Happens When You Run `yarn install`

### First Time (After Cloning)

```bash
cd template-projects
yarn install
```

**Yarn does the following:**

1. **Reads all workspace `package.json` files**
   - Scans `shared/*/package.json` and each game's `package.json`

2. **Collects all dependencies**
   - Combines dependencies from all workspace packages

3. **Hoists shared dependencies**
   - Installs common packages (like `react`) to root `node_modules`
   - Avoids duplication

4. **Creates symlinks**
   - Links `@minigame/tutorial-viewer` → `shared/tutorial-viewer/`
   - Links workspace packages to root `node_modules`

**Result:**
```
template-projects/
├── node_modules/
│   ├── react/              # Hoisted to root
│   ├── @minigame/
│   │   └── tutorial-viewer → ../../shared/tutorial-viewer
│   └── [other packages]
│
├── shared/tutorial-viewer/
└── group-sort/
```

### In Your Game Folder

```bash
cd group-sort
yarn install
```

**Yarn recognizes this is a workspace** and:
- Links to root `node_modules`
- Makes workspace packages available

---

## Why You Can Work Directly in Game Folders

### After Initial Setup

Once `yarn install` has been run from the root:

```bash
cd template-projects/group-sort
code .        # Open in VS Code
yarn dev      # Works immediately
```

**Why this works:**

1. **`node_modules` is linked**
   - `group-sort/node_modules` symlinks to root `node_modules`
   - All dependencies are available

2. **Workspace packages are resolved**
   - `@minigame/tutorial-viewer` → `shared/tutorial-viewer/`
   - TypeScript finds types automatically

3. **Vite handles the rest**
   - Resolves imports via `node_modules`
   - Hot reload works normally

### No Need to Go Back to Root

After the initial setup, you **never need to go back to the root** unless:
- Adding a new workspace package
- Updating workspace configuration
- Troubleshooting

---

## Prerequisites After Cloning

### For Developers

**Required:**
1. **Node.js 20+**
   ```bash
   node --version  # Should be v20.x or higher
   ```

2. **Yarn 4.13.0** (via Corepack)
   ```bash
   corepack enable
   corepack prepare yarn@4.13.0 --activate
   yarn --version  # Should be 4.13.0
   ```

**One-time setup:**
```bash
cd template-projects
yarn install
```

**Then work in your game:**
```bash
cd group-sort
yarn dev
```

### For CI/CD

Same prerequisites:
1. Node.js 20+
2. Yarn 4.13.0
3. Run `yarn install` from `template-projects/` root
4. Build individual games as needed

---

## Common Scenarios

### Scenario 1: New Developer Joins

```bash
# Clone repository
git clone <repo>
cd template-projects

# Enable Yarn 4
corepack enable
corepack prepare yarn@4.13.0 --activate

# Install dependencies
yarn install

# Work on game
cd group-sort
yarn dev
```

### Scenario 2: Adding Tutorial Viewer to Your Game

```bash
# In your game folder
cd group-sort

# Edit package.json, add:
# "dependencies": { "@minigame/tutorial-viewer": "workspace:*" }

# Install
yarn install

# Use it
# import { TutorialViewer } from "@minigame/tutorial-viewer";
```

### Scenario 3: Modifying the Shared Component

```bash
# Work on tutorial-viewer
cd shared/tutorial-viewer
yarn dev

# Changes are immediately available in all games
# No rebuild needed!
```

---

## Key Concepts

### 1. Workspace Packages ≠ npm Packages

- Workspace packages use `workspace:*` in dependencies
- They're never published to npm
- Changes are immediately available (no version management)

### 2. Source Files Are Used Directly

- No build step needed for shared components
- Your Vite dev server handles imports
- TypeScript resolves types from source

### 3. Independent Development

- Each game can be opened in IDE separately
- No need to open the entire monorepo
- Workspace packages work transparently

### 4. Unique Names Required

Each workspace package must have a **unique name**:

```json
{
  "name": "group-sort",           // ← Game template
  "name": "@minigame/tutorial-viewer"  // ← Shared package
}
```

This prevents the "Duplicate workspace name" error.

---

## Troubleshooting

### "Duplicate workspace name" Error

**Cause:** Two projects have the same `"name"` in `package.json`

**Solution:** Ensure each project has a unique name:
```json
{
  "name": "group-sort"  // Use the folder name!
}
```

### "Module not found" After Cloning

**Cause:** Haven't run `yarn install` from root yet

**Solution:**
```bash
cd template-projects
yarn install
```

### Changes to Shared Component Don't Appear

**Cause:** Dev server needs restart

**Solution:**
```bash
# In your game folder
# Stop dev server (Ctrl+C)
yarn dev  # Restart
```

---

## Summary

| Question | Answer |
|----------|--------|
| **What do I need after cloning?** | Node.js 20+, Yarn 4.13.0, run `yarn install` from root |
| **Can I work in my game folder?** | Yes! After initial setup, stay in your game folder |
| **Do I need to build shared components?** | No! Source files are used directly |
| **How do I add a shared component?** | Add `workspace:*` dependency, run `yarn install` |
| **What if I get errors?** | Run `yarn install` from `template-projects` root |

---

## Resources

- [SETUP.md](template-projects/SETUP.md) - Setup instructions
- [WORKSPACE_GUIDE.md](template-projects/WORKSPACE_GUIDE.md) - Complete guide
- [Yarn Workspaces Docs](https://yarnpkg.com/features/workspaces) - Official docs
