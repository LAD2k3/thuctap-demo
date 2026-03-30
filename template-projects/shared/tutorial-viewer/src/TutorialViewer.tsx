import { useState, useEffect, useCallback } from "react";
import styles from "./TutorialViewer.module.css";

export interface TutorialImage {
  src: string;
  alt?: string;
}

export interface TutorialViewerProps {
  /** Whether the viewer is visible */
  isOpen: boolean;
  /** Callback when closing the viewer */
  onClose: () => void;
  /** 
   * List of tutorial images. 
   * If not provided, will auto-load tutorial-N.png files 
   */
  images?: TutorialImage[];
  /** 
   * Base path for auto-loaded images. 
   * Default: "images/" 
   */
  basePath?: string;
  /** 
   * Base filename pattern. 
   * Default: "tutorial" (will load tutorial-1.png, tutorial-2.png, etc.) 
   */
  filenamePattern?: string;
  /** 
   * File extension for auto-loaded images. 
   * Default: "png" 
   */
  fileExtension?: string;
  /** 
   * Starting index for auto-loaded images (1-based). 
   * Default: 1 
   */
  startIndex?: number;
}

interface AutoLoadedImage extends TutorialImage {
  index: number;
}

export function TutorialViewer({
  isOpen,
  onClose,
  images,
  basePath = "images/",
  filenamePattern = "tutorial",
  fileExtension = "png",
  startIndex = 1,
}: TutorialViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoLoadedImages, setAutoLoadedImages] = useState<AutoLoadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use provided images or auto-load tutorial-N.png files
  const tutorialImages: TutorialImage[] = images || autoLoadedImages;
  const totalImages = tutorialImages.length;

  // Auto-load images when viewer opens or config changes
  useEffect(() => {
    if (!images && isOpen) {
      setIsLoading(true);
      const loaded: AutoLoadedImage[] = [];
      let index = startIndex;

      const loadImage = (currentIndex: number): Promise<void> => {
        return new Promise((resolve) => {
          const img = new Image();
          const src = `${basePath}${filenamePattern}-${currentIndex}.${fileExtension}`;
          
          img.onload = () => {
            loaded.push({ src, index: currentIndex });
            resolve();
          };
          
          img.onerror = () => {
            resolve(); // Stop loading
          };
          
          img.src = src;
        });
      };

      const loadAllImages = async () => {
        loaded.length = 0;
        index = startIndex;
        
        while (true) {
          const prevLength = loaded.length;
          await loadImage(index);
          
          // If no new image was loaded, stop
          if (loaded.length === prevLength) {
            break;
          }
          
          index++;
          
          // Safety limit to prevent infinite loops
          if (index > startIndex + 100) {
            break;
          }
        }
        
        setAutoLoadedImages(loaded);
        setIsLoading(false);
        setCurrentIndex(0);
      };

      loadAllImages();
    }
  }, [images, isOpen, basePath, filenamePattern, fileExtension, startIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [isOpen, goToNext, goToPrev, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || totalImages === 0) {
    return null;
  }

  const currentImage = tutorialImages[currentIndex];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Tutorial {currentIndex + 1} / {totalImages}
          </h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.imageContainer}>
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            currentImage && (
              <img
                src={currentImage.src}
                alt={currentImage.alt || `Tutorial step ${currentIndex + 1}`}
                className={styles.image}
              />
            )
          )}
        </div>

        <div className={styles.controls}>
          <button
            className={styles.navButton}
            onClick={goToPrev}
            disabled={isLoading}
            aria-label="Previous"
          >
            ← Back
          </button>
          <span className={styles.pageIndicator}>
            {currentIndex + 1} / {totalImages}
          </span>
          <button
            className={styles.navButton}
            onClick={goToNext}
            disabled={isLoading}
            aria-label="Next"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
