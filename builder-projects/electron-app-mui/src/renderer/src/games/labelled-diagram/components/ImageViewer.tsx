import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { TransformComponent, TransformWrapper, useTransformComponent } from 'react-zoom-pan-pinch'
import { LabelledDiagramPoint } from '../../../types'
import { DraggablePoint } from './DraggablePoint'

interface ImageViewerProps {
  imagePath: string
  projectDir: string
  points: LabelledDiagramPoint[]
  selectedPointId: string | null
  onImageDoubleClick: (xPercent: number, yPercent: number) => void
  onPointDrag: (id: string, xPercent: number, yPercent: number) => void
  getPointColor: (index: number) => { bg: string; text: string }
  onAddPointAtCenter: (xPercent: number, yPercent: number) => void
  onShowWarning: (message: string | null) => void
  onSelectPoint: (id: string) => void
}

/**
 * Renders point badges inside the transformed content (sibling of the image).
 * Each badge is counter-scaled to maintain a constant screen-pixel size.
 */
function PointsOverlay({
  points,
  selectedPointId,
  onSelectPoint,
  onPointDrag,
  getPointColor
}: {
  points: LabelledDiagramPoint[]
  selectedPointId: string | null
  onSelectPoint: (id: string) => void
  onPointDrag: (id: string, xPercent: number, yPercent: number) => void
  getPointColor: (index: number) => { bg: string; text: string }
}): React.ReactElement | null {
  const currentScale = useTransformComponent(({ instance }) => instance.transformState.scale)

  if (currentScale <= 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 50
      }}
    >
      {points.map((point, pointIndex) => (
        <DraggablePoint
          key={point.id}
          point={point}
          index={pointIndex}
          isSelected={point.id === selectedPointId}
          getPointColor={getPointColor}
          onDragEnd={onPointDrag}
          onSelect={onSelectPoint}
          scale={currentScale}
        />
      ))}
    </div>
  )
}

export function ImageViewer({
  imagePath,
  projectDir,
  points,
  selectedPointId,
  onImageDoubleClick,
  onPointDrag,
  getPointColor,
  onAddPointAtCenter,
  onShowWarning,
  onSelectPoint
}: ImageViewerProps): React.ReactElement {
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Resolve image asset URL
  useEffect(() => {
    let mounted = true
    const loadUrl = async () => {
      try {
        const url = await window.electronAPI.resolveAssetUrl(projectDir, imagePath)
        if (mounted) setImageUrl(url)
      } catch {
        /* ignore */
      }
    }
    loadUrl()
    return () => {
      mounted = false
    }
  }, [projectDir, imagePath])

  // Double-click on image area to create a new point
  const handleImageDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.draggable-point')) return

      const wrapper = e.currentTarget.closest('.react-transform-wrapper')
      if (!wrapper) return
      const content = wrapper.querySelector('.react-transform-component')
      if (!content) return

      const contentRect = content.getBoundingClientRect()
      const xPercent = Math.max(
        0,
        Math.min(100, ((e.clientX - contentRect.left) / contentRect.width) * 100)
      )
      const yPercent = Math.max(
        0,
        Math.min(100, ((e.clientY - contentRect.top) / contentRect.height) * 100)
      )
      onImageDoubleClick(xPercent, yPercent)
    },
    [onImageDoubleClick]
  )

  // Add a point at the center of the current view
  const handleAddPointAtCenter = useCallback(() => {
    if (!transformComponentRef.current || !wrapperRef.current) {
      onShowWarning('Cannot determine view center')
      return
    }

    const wrapper = wrapperRef.current
    const content = wrapper.querySelector('.react-transform-component')
    if (!content) {
      onShowWarning('Cannot determine view center')
      return
    }

    const wrapperRect = wrapper.getBoundingClientRect()
    const contentRect = content.getBoundingClientRect()

    const relativeX =
      (wrapperRect.left + wrapperRect.width / 2 - contentRect.left) / contentRect.width
    const relativeY =
      (wrapperRect.top + wrapperRect.height / 2 - contentRect.top) / contentRect.height

    if (relativeX < 0 || relativeX > 1 || relativeY < 0 || relativeY > 1) {
      onShowWarning(
        'The center of the view is outside the image. Zoom or pan to show the image center.'
      )
      return
    }

    onAddPointAtCenter(relativeX * 100, relativeY * 100)
  }, [onAddPointAtCenter, onShowWarning])

  // Listen for the custom "add point at center" event dispatched by PointListPanel
  useEffect(() => {
    const handleCustomEvent = () => handleAddPointAtCenter()
    window.addEventListener('labelled-diagram-add-point-center', handleCustomEvent)
    return () => window.removeEventListener('labelled-diagram-add-point-center', handleCustomEvent)
  }, [handleAddPointAtCenter])

  return (
    <TransformWrapper
      ref={transformComponentRef}
      initialScale={1}
      minScale={1}
      maxScale={5}
      centerOnInit
      limitToBounds={true}
      doubleClick={{ disabled: true }}
      panning={{
        disabled: false,
        velocityDisabled: true,
        allowLeftClickPan: true,
        allowRightClickPan: false,
        allowMiddleClickPan: false
      }}
      wheel={{ step: 0.2, disabled: false }}
    >
      <TransformComponent
        wrapperStyle={{ width: '100%', height: '100%', cursor: 'default' }}
        wrapperClass="image-viewer-wrapper"
        contentClass="image-viewer-content"
      >
        <div
          ref={wrapperRef}
          style={{ position: 'relative', display: 'inline-block' }}
          onDoubleClick={handleImageDoubleClick}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Diagram"
              style={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                userSelect: 'none',
                pointerEvents: 'auto'
              }}
            />
          )}

          {/* Point badges rendered inside the transform, counter-scaled per badge */}
          <PointsOverlay
            points={points}
            selectedPointId={selectedPointId}
            onSelectPoint={onSelectPoint}
            onPointDrag={onPointDrag}
            getPointColor={getPointColor}
          />
        </div>
      </TransformComponent>
    </TransformWrapper>
  )
}
