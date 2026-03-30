# Template Projects Workspace Guide

This directory is configured as a **Yarn Workspace** monorepo, allowing template projects to share common components while remaining independently developable.

## Quick Links

- **[SETUP.md](SETUP.md)** - Start here! Setup instructions for developers
- **[shared/tutorial-viewer/README.md](shared/tutorial-viewer/README.md)** - Tutorial Viewer component docs
- **[shared/tutorial-viewer/EXAMPLE.md](shared/tutorial-viewer/EXAMPLE.md)** - Integration examples

---

## Workspace Structure

```
template-projects/
├── shared/                     # Shared library components
│   └── tutorial-viewer/        # Tutorial Viewer component
│       ├── package.json        # Name: @minigame/tutorial-viewer
│       ├── src/
│       │   ├── index.ts
│       │   ├── TutorialViewer.tsx
│       │   └── TutorialViewer.module.css
│       └── README.md
│
├── group-sort/                 # Game templates
├── balloon-letter-picker/
├── labelled-diagram/
├── pair-matching/
├── plane-quiz/
├── whack-a-mole/
└── word-search/
```

---

## How Yarn Workspaces Work

### Key Concept

Each template project remains **independently developable** - you can still:

```bash
cd template-projects/group-sort
code .              # Open in VS Code
yarn install        # Installs workspace dependencies
yarn dev            # Run development server
yarn build          # Build the game
```

But now projects can also **share code** through workspace packages like `@minigame/tutorial-viewer`.

### Package Resolution

When a template project references `@minigame/tutorial-viewer`:

```json
{
  "dependencies": {
    "@minigame/tutorial-viewer": "workspace:*"
  }
}
```

Yarn resolves it to the local `shared/tutorial-viewer/` folder, not npm. This means:

- ✅ Changes to the component are immediately available
- ✅ No need to publish to npm
- ✅ Full TypeScript support with source types
- ✅ Source code is used directly (no build step needed for dev)

---

## For Game Template Authors

### Using the Tutorial Viewer

**1. Add to your `package.json` dependencies:**

```json
{
  "dependencies": {
    "@minigame/tutorial-viewer": "workspace:*"
  }
}
```

**2. Install from your game folder:**

```bash
cd group-sort
yarn install
```

**3. Use in your code:**

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

### Do I Need to Build the Component?

**No!** The workspace uses source files directly. Your Vite dev server handles it automatically.

---

## For Component Developers

### Working on shared/tutorial-viewer

```bash
cd template-projects/shared/tutorial-viewer
yarn dev      # Run Vite dev server (for testing)
yarn build    # Build library output (optional)
```

### Testing Changes

Changes to the component are **immediately available** in all games that use it. No rebuild needed!

---

## Workspace Configuration

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

This tells Yarn:
- These folders are workspace packages
- Hoist shared dependencies to root `node_modules`
- Enable cross-package imports

### Individual Project `package.json`

Each template project keeps its own `package.json` with a **unique name**:

```json
{
  "name": "group-sort",  // ← Must be unique!
  "private": true,
  "dependencies": {
    "@minigame/tutorial-viewer": "workspace:*",
    "react": "^19.2.4",
    // ... other dependencies
  }
}
```

---

## IDE Setup

### VS Code

You can open **any** of these folders directly:

**Option 1: Open individual project (Recommended)**
```bash
cd template-projects/group-sort
code .
```

TypeScript will resolve workspace packages correctly because Yarn creates the proper symlinks in `node_modules`.

**Option 2: Open workspace root**
```bash
cd template-projects
code .
```

This gives you a multi-root workspace view of all projects.

### Recommended: Individual Project

For template authors working on a single game, **opening the individual project folder** is recommended:

- Cleaner workspace
- Project-specific settings
- All workspace dependencies still work
- No confusion from seeing other projects' files

---

## Creating New Shared Components

### Structure

```
shared/
└── my-component/
    ├── package.json          # Name: @minigame/my-component
    ├── vite.config.ts        # Vite Library Mode config
    ├── tsconfig.json
    ├── src/
    │   ├── index.ts          # Entry point
    │   ├── MyComponent.tsx   # Component
    │   └── MyComponent.module.css  # Scoped styles
    └── README.md             # Usage docs
```

### `package.json` Template

```json
{
  "name": "@minigame/my-component",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "types": "./src/index.ts"
    }
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "packageManager": "yarn@4.13.0"
}
```

### Register the Component

Add to root `package.json` workspaces:

```json
{
  "workspaces": [
    "shared/*",
    "...other projects"
  ]
}
```

Then run from root:
```bash
cd template-projects
yarn install
```

---

## Troubleshooting

### "Duplicate workspace name" error

This means two projects have the same `"name"` in `package.json`. Each workspace package must have a unique name.

**Solution:** Make sure each project's `package.json` has a unique name matching its folder:

```json
{
  "name": "group-sort",  // ← Use the folder name!
  "private": true
}
```

### "Module not found: @minigame/tutorial-viewer"

**Solution:** Run `yarn install` from the `template-projects` root or your game folder:

```bash
cd template-projects/group-sort
yarn install
```

### TypeScript can't find types

**Solution:** Restart the TypeScript server in your IDE:

- VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Changes to component don't appear

**Solution:** The workspace uses source files directly. If changes don't appear:

1. Check you're using `workspace:*` not a version number
2. Restart the dev server (`yarn dev`)
3. Clear browser cache

### Yarn version issues

If you see warnings about Yarn version:

```bash
corepack enable
corepack prepare yarn@4.13.0 --activate
```

---

## Benefits of This Approach

✅ **Shared code without duplication** - Common components live in one place

✅ **Independent development** - Each template can be opened and worked on separately

✅ **No npm publishing** - Everything stays local to the workspace

✅ **Type safety** - Full TypeScript support across packages

✅ **Instant updates** - Changes to shared components are immediately available

✅ **Clean separation** - Template authors only see what they need

---

## Resources

- [SETUP.md](SETUP.md) - Setup instructions for developers
- [shared/tutorial-viewer/README.md](shared/tutorial-viewer/README.md) - Component documentation
- [shared/tutorial-viewer/EXAMPLE.md](shared/tutorial-viewer/EXAMPLE.md) - Integration guide
- [Yarn Workspaces Docs](https://yarnpkg.com/features/workspaces) - Official documentation
