# Tutorial Images

Place your tutorial images in this folder. The Tutorial Viewer component will auto-load images named:

- `tutorial-1.png`
- `tutorial-2.png`
- `tutorial-3.png`
- ... and so on

## Recommended Image Specifications

- **Format**: PNG (recommended for screenshots with text) or JPG (for photos)
- **Size**: 800x600 pixels or similar aspect ratio (4:3)
- **File size**: Keep under 500KB per image for fast loading

## Example Workflow

1. Take screenshots of your game's tutorial steps
2. Save them as `tutorial-1.png`, `tutorial-2.png`, etc.
3. The Tutorial Viewer will automatically load them in order

## Custom Image Names

If you want to use different filenames, configure the TutorialViewer props:

```tsx
<TutorialViewer
  isOpen={showTutorial}
  onClose={() => setShowTutorial(false)}
  basePath="images/"
  filenamePattern="guide"      // Loads guide-1.png, guide-2.png, etc.
  fileExtension="jpg"
/>
```

## Manual Image List

Alternatively, provide exact image paths:

```tsx
<TutorialViewer
  isOpen={showTutorial}
  onClose={() => setShowTutorial(false)}
  images={[
    { src: "images/intro.png", alt: "Introduction" },
    { src: "images/step1.png", alt: "Step 1" },
    { src: "images/step2.png", alt: "Step 2" },
  ]}
/>
```
