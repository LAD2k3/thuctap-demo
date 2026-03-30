# Tutorial Viewer Implementation Summary

## Overview

A shared **Tutorial Viewer** component has been created for all template projects to use. This component displays tutorial images with navigation controls (back, next, close buttons).

## What Was Created

### 1. Tutorial Viewer Package (`template-projects/shared/tutorial-viewer/`)

A reusable React component library with:

- **Auto-loading**: Automatically loads `tutorial-N.png` files sequentially
- **Manual mode**: Optionally provide custom image paths
- **Keyboard navigation**: Arrow keys + Escape
- **Scoped CSS**: CSS Modules prevent namespace pollution
- **TypeScript**: Full type safety

**Files created:**
```
shared/tutorial-viewer/
├── src/
│   ├── index.ts                      # Entry point
│   ├── TutorialViewer.tsx            # Main component
│   └── TutorialViewer.module.css     # Scoped styles
├── package.json                      # Workspace package config
├── vite.config.ts                    # Vite Library Mode
├── tsconfig.json
├── README.md                         # Usage docs
├── EXAMPLE.md                        # Integration example
└── .gitignore
```

### 2. Workspace Configuration (`template-projects/`)

Set up Yarn Workspaces to enable code sharing:

**Files created/modified:**
- `template-projects/package.json` - Workspace root config
- `template-projects/SETUP.md` - Setup instructions for developers
- `template-projects/WORKSPACE_GUIDE.md` - Comprehensive guide

**Key features:**
- Each template project remains independently developable
- Shared packages use `workspace:*` protocol
- No npm publishing needed
- Full TypeScript support

### 3. Example Integration (`template-projects/group-sort/`)

Updated the group-sort template to demonstrate usage:

**Modified files:**
- `group-sort/package.json` - Added tutorial-viewer dependency
- `group-sort/src/components/MatchingGameDemo.tsx` - Integrated TutorialViewer

**Usage example:**
```tsx
import { TutorialViewer } from "@minigame/tutorial-viewer";

function App() {
  const [showTutorial, setShowTutorial] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowTutorial(true)}>
        📖 Hướng dẫn
      </button>
      <TutorialViewer
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        basePath="images/"
        filenamePattern="tutorial"
        fileExtension="png"
      />
    </>
  );
}
```

## How to Use in Your Template Project

### Step 1: Add Dependency

In your template's `package.json`:

```json
{
  "dependencies": {
    "@minigame/tutorial-viewer": "workspace:*"
  }
}
```

### Step 2: Install

From your game folder:

```bash
cd group-sort
yarn install
```

> **Note:** If this is your first time after cloning, run `yarn install` from `template-projects` root first. See [SETUP.md](template-projects/SETUP.md) for details.

### Step 3: Add Tutorial Images

Place images in your project's `images/` folder:

```
images/
├── tutorial-1.png
├── tutorial-2.png
└── tutorial-3.png
```

### Step 4: Import and Use

```tsx
import { TutorialViewer } from "@minigame/tutorial-viewer";

function App() {
  const [showTutorial, setShowTutorial] = useState(false);
  
  return (
    <>
      <TutorialViewer
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </>
  );
}
```

## Architecture Decisions

### Why Yarn Workspaces?

- ✅ **Independent development**: Each project can be opened separately in IDE
- ✅ **No automatic builds**: Template authors control when to build
- ✅ **Source-level sharing**: Changes to components are immediately visible
- ✅ **Type safety**: TypeScript resolves types across packages

### Why Not Other Approaches?

- ❌ **npm package**: Would require publishing, version management
- ❌ **Git submodule**: Too complex, tight coupling
- ❌ **Copy-paste**: Code duplication, hard to maintain
- ❌ **Monorepo with auto-builds**: Violates "independent IDE" requirement

### CSS Modules

Used CSS Modules (`.module.css`) instead of:
- ❌ Global CSS: Would pollute namespace
- ❌ CSS-in-JS: Adds runtime overhead
- ❌ Styled-components: Extra dependency, runtime cost

CSS Modules provide:
- ✅ Zero runtime overhead
- ✅ Automatic scoping
- ✅ Build-time resolution
- ✅ No new dependencies

## File Structure

```
template-projects/
├── package.json                      # ⭐ NEW: Workspace root
├── SETUP.md                          # ⭐ NEW: Setup instructions
├── WORKSPACE_GUIDE.md                # ⭐ NEW: Comprehensive guide
│
├── shared/                           # ⭐ NEW: Shared components
│   └── tutorial-viewer/
│       ├── package.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── TutorialViewer.tsx
│       │   └── TutorialViewer.module.css
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── README.md
│       └── EXAMPLE.md
│
├── group-sort/                       # ⭐ UPDATED: Example integration
│   ├── package.json                  # Added tutorial-viewer dependency
│   ├── src/components/MatchingGameDemo.tsx  # Integrated TutorialViewer
│   └── images/
│       └── README.md                 # Instructions for tutorial images
│
└── [other templates...]              # Can use tutorial-viewer similarly
```

## Testing the Setup

### Test Tutorial Viewer Component

```bash
cd template-projects/tutorial-viewer
yarn install
yarn dev
```

### Test Group-Sort Integration

```bash
cd template-projects/group-sort
yarn install
yarn dev
```

Click the "📖 Hướng dẫn" button to see the tutorial viewer.

### Build All

```bash
cd template-projects
yarn build:all
```

## Next Steps for Template Authors

1. **Read the guide**: See `WORKSPACE_GUIDE.md` for detailed documentation
2. **Check the example**: See `group-sort/` for working integration
3. **Add to your project**: Follow the steps above
4. **Create tutorial images**: Add `tutorial-N.png` files to your `images/` folder

## Documentation

- **Component docs**: `template-projects/shared/tutorial-viewer/README.md`
- **Integration example**: `template-projects/shared/tutorial-viewer/EXAMPLE.md`
- **Setup guide**: `template-projects/SETUP.md` (start here!)
- **Workspace guide**: `template-projects/WORKSPACE_GUIDE.md`
- **Images guide**: `template-projects/group-sort/images/README.md`

## Technical Details

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | required | Visibility control |
| `onClose` | () => void | required | Close callback |
| `images` | TutorialImage[] | optional | Custom image list |
| `basePath` | string | "images/" | Auto-load base path |
| `filenamePattern` | string | "tutorial" | Filename pattern |
| `fileExtension` | string | "png" | File extension |
| `startIndex` | number | 1 | Starting index |

### Auto-Load Algorithm

The component loads images sequentially:

1. Try to load `tutorial-1.png`
2. If successful, try `tutorial-2.png`
3. Continue until a load fails
4. Stop and use all successfully loaded images

This means you don't need to specify the count - just add images and they'll be found automatically.

### Keyboard Shortcuts

- **Arrow Right**: Next image
- **Arrow Left**: Previous image
- **Escape**: Close viewer

## Troubleshooting

See `template-projects/WORKSPACE_GUIDE.md` for detailed troubleshooting.

Quick fixes:

- **"Module not found"**: Run `yarn install` from `template-projects` root
- **TypeScript errors**: Restart TS server in IDE
- **Images don't load**: Check file paths and names

## Future Enhancements

Possible improvements (not implemented yet):

- Touch/swipe gestures for mobile
- Image captions/descriptions
- Progress bar
- Thumbnail navigation
- Video support
- Custom themes

These can be added to the tutorial-viewer component later without breaking existing usage.
