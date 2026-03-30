# Tutorial Viewer Component

A reusable React component for displaying tutorial images with navigation controls.

## Features

- **Auto-loading images**: Automatically loads `tutorial-1.png`, `tutorial-2.png`, etc. until no more images are found
- **Manual image list**: Optionally provide your own list of image sources
- **Keyboard navigation**: Arrow keys to navigate, Escape to close
- **Scoped CSS**: Uses CSS Modules to avoid polluting global CSS namespace
- **Responsive**: Works on different screen sizes
- **Accessible**: ARIA labels and keyboard support

## Installation

In your game template project (e.g., `group-sort/`):

1. **Add the dependency** to your `package.json`:

```json
{
  "dependencies": {
    "@minigame/tutorial-viewer": "workspace:*"
  }
}
```

2. **Install from the template-projects root**:

```bash
cd template-projects
yarn install
```

This sets up the workspace link so your project can import the component.

## Usage

### Basic Usage (Auto-load images)

Place your tutorial images in your project's `images/` folder named `tutorial-1.png`, `tutorial-2.png`, etc.

```tsx
import { useState } from "react";
import { TutorialViewer } from "@minigame/tutorial-viewer";

function App() {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <>
      <button onClick={() => setShowTutorial(true)}>Show Tutorial</button>
      
      <TutorialViewer
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </>
  );
}
```

### With Custom Image Paths

```tsx
import { TutorialViewer, type TutorialImage } from "@minigame/tutorial-viewer";

const tutorialImages: TutorialImage[] = [
  { src: "images/intro.png", alt: "Introduction" },
  { src: "images/step1.png", alt: "Step 1" },
  { src: "images/step2.png", alt: "Step 2" },
];

function App() {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <>
      <button onClick={() => setShowTutorial(true)}>Show Tutorial</button>
      
      <TutorialViewer
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        images={tutorialImages}
      />
    </>
  );
}
```

### With Custom Configuration

```tsx
<TutorialViewer
  isOpen={showTutorial}
  onClose={() => setShowTutorial(false)}
  basePath="assets/tutorials/"
  filenamePattern="guide"
  fileExtension="jpg"
  startIndex={0}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Whether the viewer is visible |
| `onClose` | `() => void` | required | Callback when closing the viewer |
| `images` | `TutorialImage[]` | optional | Custom list of images. If not provided, auto-loads from files |
| `basePath` | `string` | `"images/"` | Base path for auto-loaded images |
| `filenamePattern` | `string` | `"tutorial"` | Filename pattern (loads `{pattern}-N.{ext}`) |
| `fileExtension` | `string` | `"png"` | File extension for auto-loaded images |
| `startIndex` | `number` | `1` | Starting index for auto-loaded images |

## Development

The tutorial-viewer is a **workspace package** - it's developed alongside the game templates but is not published to npm.

### Running Locally

```bash
cd template-projects/tutorial-viewer
yarn dev
```

### Building

```bash
cd template-projects/tutorial-viewer
yarn build
```

The built output goes to `dist/` but during development, the source is used directly via workspace links.

## Project Structure

```
tutorial-viewer/
├── src/
│   ├── index.ts                    # Entry point & exports
│   ├── TutorialViewer.tsx          # Main component
│   └── TutorialViewer.module.css   # Locally scoped styles
├── package.json
├── vite.config.ts                  # Vite Library Mode config
├── tsconfig.json
└── README.md
```

## How It Works

### Workspace Setup

The `template-projects/` directory is configured as a **Yarn workspace**. This means:

1. Each subdirectory (including `tutorial-viewer` and game templates) is a workspace package
2. Packages can reference each other using `workspace:*` in their dependencies
3. Running `yarn install` at the root links all packages together
4. Each game template can still be opened independently in an IDE

### Development Workflow

**Option 1: Work from template-projects root**

```bash
cd template-projects
yarn install
# Now open any game template folder in your IDE
```

**Option 2: Work inside individual project**

```bash
cd template-projects/group-sort
yarn install  # This runs from the workspace root automatically
# Your IDE has access to all workspace packages
```

Both approaches work because Yarn workspaces hoist dependencies to the root `node_modules`.

### Vite Library Mode

The component uses Vite's library mode to:

- Bundle the component as an ES module
- Generate TypeScript declarations
- Keep React as a peer dependency (not bundled)
- Support CSS Modules for scoped styling

## CSS Scoping

Styles are scoped locally using **CSS Modules** (`.module.css` files). This means:

- Class names are automatically hashed (e.g., `.overlay` → `.overlay_abc123`)
- No global CSS pollution
- No conflicts with other components
- Styles are bundled with the component

## License

This component is part of the Minigame Builder project and is only intended for use within this monorepo.
