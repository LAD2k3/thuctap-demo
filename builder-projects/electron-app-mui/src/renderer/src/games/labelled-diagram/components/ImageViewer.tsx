import { Box } from '@mui/material'
import { motion } from 'framer-motion'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { Context, TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { LabelledDiagramPoint } from '../../../types'

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

interface DraggablePointProps {
  point: LabelledDiagramPoint
  index: number
  isSelected: boolean
  getPointColor: (index: number) => { bg: string; text: string }
  onDragEnd: (id: string, xPercent: number, yPercent: number) => void
  onSelect: (id: string) => void
}

/**
 * Fixed version of KeepScale from react-zoom-pan-pinch.
 * The original KeepScale only applies the counter-transform inside the onChange
 * callback, so newly mounted elements don't get counter-scaled until the next
 * zoom/pan event fires. This version applies the counter-scale immediately on
 * mount using the current transformState.scale, then subscribes to updates.
 *
 * IMPORTANT: This wrapper creates a counter-scaled coordinate space where
 * 1 unit = 1 screen pixel. All positioning (left, top, margin, etc.) of
 * children is in screen pixels, NOT content pixels.
 */
function FixedKeepScale({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  const localRef = useRef<HTMLDivElement>(null)
  const instance = useContext(Context)

  const applyCounterScale = useCallback(
    (scale: number) => {
      if (localRef.current) {
        const inverse = 1 / scale
        localRef.current.style.transform =
          instance.handleTransformStyles(0, 0, inverse)
      }
    },
    [instance]
  )

  useEffect(() => {
    // Apply immediately on mount so newly created elements are counter-scaled
    applyCounterScale(instance.transformState.scale)
    // Subscribe to future transform changes
    return instance.onChange((ctx) => {
      applyCounterScale(ctx.instance.transformState.scale)
    })
  }, [instance, applyCounterScale])

  return (
    <div ref={localRef} style={style} {...props}>
      {children}
    </div>
  )
}

/** Extract solid rgb(r, g, b) from an rgba(...) color string */
function solidColor(rgba: string): string {
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  return m ? `rgb(${m[1]}, ${m[2]}, ${m[3]})` : rgba
}

const BADGE_SIZE = 32
const HALF_BADGE = BADGE_SIZE / 2 // 16

function DraggablePoint({
  point,
  index,
  isSelected,
  getPointColor,
  onDragEnd,
  onSelect
}: DraggablePointProps): React.ReactElement {
  const pointRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [dragPosition, setDragPosition] = useState({ x: point.xPercent, y: point.yPercent })
  const pointColor = getPointColor(index)
  const ringColor = solidColor(pointColor.bg)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onSelect(point.id)
      setIsDragging(true)
      setShowTooltip(false)
      setDragPosition({ x: point.xPercent, y: point.yPercent })
    },
    [point.id, point.xPercent, point.yPercent, onSelect]
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      const content = pointRef.current?.closest('.react-transform-component')
      if (!content) return

      const contentRect = content.getBoundingClientRect()
      const newPercentX = Math.max(0, Math.min(100, ((e.clientX - contentRect.left) / contentRect.width) * 100))
      const newPercentY = Math.max(0, Math.min(100, ((e.clientY - contentRect.top) / contentRect.height) * 100))
      setDragPosition({ x: newPercentX, y: newPercentY })
    }

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      setIsDragging(false)
      onDragEnd(point.id, dragPosition.x, dragPosition.y)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: false })
    window.addEventListener('mouseup', handleMouseUp, { passive: false })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, point.id, dragPosition.x, dragPosition.y, onDragEnd])

  const displayX = isDragging ? dragPosition.x : point.xPercent
  const displayY = isDragging ? dragPosition.y : point.yPercent

  return (
    <div
      ref={pointRef}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => {
        if (!isDragging) {
          setShowTooltip(true)
          setIsHovered(true)
        }
      }}
      onMouseLeave={() => {
        setShowTooltip(false)
        setIsHovered(false)
      }}
      style={{
        position: 'absolute',
        left: `${displayX}%`,
        top: `${displayY}%`,
        width: 0,
        height: 0,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging || isSelected ? 1000 : 100
      }}
    >
      {/* ── Pulsing Ring (selected point) ───────────────────────────── */}
      {isSelected && (
        <FixedKeepScale style={{ position: 'absolute', width: 0, height: 0 }}>
          <motion.div
            style={{
              position: 'absolute',
              borderRadius: '50%',
              border: `3px solid ${ringColor}`,
              pointerEvents: 'none',
              // Start at BADGE_SIZE centered on anchor, expand to +24px
              width: BADGE_SIZE,
              height: BADGE_SIZE,
              left: -HALF_BADGE,
              top: -HALF_BADGE
            }}
            animate={{
              width: [BADGE_SIZE, BADGE_SIZE, BADGE_SIZE + 24],
              height: [BADGE_SIZE, BADGE_SIZE, BADGE_SIZE + 24],
              left: [-HALF_BADGE, -HALF_BADGE, -(HALF_BADGE + 12)],
              top: [-HALF_BADGE, -HALF_BADGE, -(HALF_BADGE + 12)],
              opacity: [0, 0.9, 0]
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeOut',
              // 0%→10%: quick fade-in (no flash), 10%→75%: full opacity while
              // staying at base size, 75%→100%: expand + fade-out
              times: [0, 0.1, 1]
            }}
          />
        </FixedKeepScale>
      )}

      {/* ── Point Badge ─────────────────────────────────────────────── */}
      <FixedKeepScale style={{ position: 'absolute', width: 0, height: 0 }}>
        <motion.div
          style={{
            position: 'absolute',
            width: BADGE_SIZE,
            height: BADGE_SIZE,
            left: -HALF_BADGE,
            top: -HALF_BADGE,
            borderRadius: '50%',
            background: pointColor.bg,
            color: pointColor.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            boxShadow:
              isDragging || isSelected
                ? '0 0 0 3px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.4)'
                : '0 2px 6px rgba(0,0,0,0.4)',
            border: isSelected ? '2px solid #fff' : '2px solid rgba(255,255,255,0.3)',
            userSelect: 'none',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          animate={isHovered && !isDragging ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{
            duration: 0.8,
            repeat: isHovered && !isDragging ? Infinity : 0,
            ease: 'easeInOut'
          }}
        >
          {index + 1}
        </motion.div>
      </FixedKeepScale>

      {/* ── Tooltip on hover ────────────────────────────────────────── */}
      {showTooltip && point.text && (
        <FixedKeepScale style={{ position: 'absolute', width: 0, height: 0 }}>
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: HALF_BADGE + 4,
              /* Center horizontally on the anchor */
              transform: 'translateX(-50%)',
              /* Fit content width — no trailing blank space */
              display: 'inline-block',
              maxWidth: 200,
              px: 1.5,
              py: 0.75,
              bgcolor: 'rgba(0,0,0,0.85)',
              color: '#fff',
              borderRadius: 1,
              fontSize: '0.8rem',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            {point.text}
          </Box>
        </FixedKeepScale>
      )}
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

  const handleImageDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.draggable-point')) return

      const wrapper = e.currentTarget.closest('.react-transform-wrapper')
      if (!wrapper) return
      const content = wrapper.querySelector('.react-transform-component')
      if (!content) return

      const contentRect = content.getBoundingClientRect()
      const xPercent = Math.max(0, Math.min(100, ((e.clientX - contentRect.left) / contentRect.width) * 100))
      const yPercent = Math.max(0, Math.min(100, ((e.clientY - contentRect.top) / contentRect.height) * 100))
      onImageDoubleClick(xPercent, yPercent)
    },
    [onImageDoubleClick]
  )

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

    const relativeX = (wrapperRect.left + wrapperRect.width / 2 - contentRect.left) / contentRect.width
    const relativeY = (wrapperRect.top + wrapperRect.height / 2 - contentRect.top) / contentRect.height

    if (relativeX < 0 || relativeX > 1 || relativeY < 0 || relativeY > 1) {
      onShowWarning('The center of the view is outside the image. Zoom or pan to show the image center.')
      return
    }

    onAddPointAtCenter(relativeX * 100, relativeY * 100)
  }, [onAddPointAtCenter, onShowWarning])

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

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            {points.map((point, pointIndex) => (
              <div key={point.id} className="draggable-point" style={{ pointerEvents: 'auto' }}>
                <DraggablePoint
                  point={point}
                  index={pointIndex}
                  isSelected={point.id === selectedPointId}
                  getPointColor={getPointColor}
                  onDragEnd={onPointDrag}
                  onSelect={onSelectPoint}
                />
              </div>
            ))}
          </div>
        </div>
      </TransformComponent>
    </TransformWrapper>
  )
}
