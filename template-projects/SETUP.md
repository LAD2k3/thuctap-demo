# Template Projects Setup Guide

**Read this first** if you're a developer working on a game template.

---

## Quick Start

### First Time Setup (After Cloning)

```bash
# 1. Go to template-projects directory
cd template-projects

# 2. Install all dependencies (including workspace packages)
yarn install

# 3. That's it! Now you can work on your specific game
cd group-sort
yarn dev
```

### Working on Your Game

After the initial setup, you can work **directly in your game folder**:

```bash
cd template-projects/group-sort
yarn dev      # Start development server
yarn build    # Build for production
```

You **don't need to** go back to the root every time - just stay in your game folder!

---

## How This Works

### Workspace Structure

```
template-projects/
├── shared/                    # ← Shared libraries (reusable components)
│   └── tutorial-viewer/       #   Example: Tutorial Viewer component
│
├── group-sort/                # ← Your game project
├── balloon-letter-picker/     # ← Other games...
└── package.json               # ← Workspace configuration
```

### What is a Yarn Workspace?

A **Yarn Workspace** lets multiple projects share dependencies and code while remaining independently developable.

**Key benefits:**
- ✅ Share code between projects (like `@minigame/tutorial-viewer`)
- ✅ Install dependencies once (hoisted to root)
- ✅ Still work in each project folder separately
- ✅ No automatic builds - you control when to build

---

## For Game Template Authors

### Your Workflow

1. **Clone the repository**
2. **Run `yarn install` once** from `template-projects/` root
3. **Work in your game folder** like a normal project

```bash
# Initial setup (only once)
cd template-projects
yarn install

# Daily work (stay in your game folder)
cd group-sort
yarn dev
yarn build
```

### Using Shared Components

If you want to use the Tutorial Viewer in your game:

**1. Add to your `package.json` dependencies:**

```json
{
  "dependencies": {
    "@minigame/tutorial-viewer": "workspace:*"
  }
}
```

**2. Run `yarn install` in your game folder:**

```bash
cd group-sort
yarn install
```

**3. Import and use:**

```tsx
import { TutorialViewer } from "@minigame/tutorial-viewer";

function App() {
  const [showTutorial, setShowTutorial] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowTutorial(true)}>
        How to Play
      </button>
      <TutorialViewer
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </>
  );
}
```

### Do I Need to Build the Shared Component?

**No!** The workspace uses source files directly. When you import `@minigame/tutorial-viewer`, it imports from `shared/tutorial-viewer/src/` - no build step needed.

Your Vite dev server will handle it automatically.

---

## For Shared Component Developers

### Working on `tutorial-viewer`

```bash
cd template-projects/shared/tutorial-viewer
yarn dev      # Run Vite dev server for testing
yarn build    # Build library (optional, for distribution)
```

### Testing Changes

Changes to the shared component are **immediately available** in all games that use it. No rebuild needed during development!

---

## Common Questions

### "Do I need to run yarn install every time?"

**No.** Only run `yarn install` when:
- ✅ First time after cloning
- ✅ You add a new dependency
- ✅ You add a new workspace package to your dependencies

### "Can I still use my IDE normally?"

**Yes!** Open your game folder directly:

```bash
cd template-projects/group-sort
code .  # Opens VS Code in group-sort folder
```

All workspace dependencies work correctly because Yarn creates symlinks in `node_modules`.

### "What if I get 'module not found' errors?"

Run `yarn install` from the `template-projects` root:

```bash
cd template-projects
yarn install
```

### "Do I need to understand workspaces to use this?"

**No.** Just remember:

1. Run `yarn install` once after cloning (from `template-projects/`)
2. Then work in your game folder normally
3. If you add `@minigame/tutorial-viewer` to dependencies, run `yarn install` again

That's it!

---

## Prerequisites

Make sure you have:

- **Node.js** 20+ 
- **Yarn** 4.13.0 (enabled via `corepack`)

Enable Yarn 4:

```bash
corepack enable
corepack prepare yarn@4.13.0 --activate
```

---

## Troubleshooting

### "Duplicate workspace name" error

This means two projects have the same `"name"` in `package.json`. Each workspace package must have a unique name.

**Solution:** Make sure each project's `package.json` has a unique name matching its folder.

### "Module not found: @minigame/tutorial-viewer"

**Solution:** Run `yarn install` from `template-projects` root:

```bash
cd template-projects
yarn install
```

### TypeScript can't find types

**Solution:** Restart TypeScript server in your IDE:
- VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Yarn version mismatch

If you see warnings about Yarn version:

```bash
corepack enable
corepack prepare yarn@4.13.0 --activate
```

---

## File Structure Reference

```
template-projects/
├── package.json               # Workspace root config
├── .yarnrc.yml                # Yarn configuration
├── .yarn/
│   └── releases/              # Yarn binary (managed by corepack)
│
├── shared/                    # Shared libraries
│   └── tutorial-viewer/
│       ├── package.json       # Name: @minigame/tutorial-viewer
│       ├── src/
│       │   ├── index.ts
│       │   ├── TutorialViewer.tsx
│       │   └── TutorialViewer.module.css
│       └── README.md
│
├── group-sort/                # Your game project
│   ├── package.json           # Name: group-sort
│   ├── src/
│   ├── index.html
│   └── images/
│
└── [other games...]           # Other game templates
```

---

## Summary

| Task | Command |
|------|---------|
| **First time setup** | `cd template-projects && yarn install` |
| **Daily dev** | `cd your-game && yarn dev` |
| **Add shared component** | Add to dependencies, then `yarn install` |
| **Build your game** | `cd your-game && yarn build` |

**Remember:** After the initial setup, you can work entirely within your game folder!
