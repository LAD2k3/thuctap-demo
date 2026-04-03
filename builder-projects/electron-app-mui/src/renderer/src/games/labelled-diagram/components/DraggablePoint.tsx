import { Box } from '@mui/material'
import { motion } from 'framer-motion'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { LabelledDiagramPoint } from '../../../types'

export const BADGE_SIZE = 32
const HALF_BADGE = BADGE_SIZE / 2 // 16

interface DraggablePointProps {
  point: LabelledDiagramPoint
  index: number
  isSelected: boolean
  getPointColor: (index: number) => { bg: string; text: string }
  onDragEnd: (id: string, xPercent: number, yPercent: number) => void
  onSelect: (id: string) => void
  /** Current zoom scale from the library — used for counter-scaling */
  scale: number
}

/**
 * A single point badge rendered inside the transformed content.
 * Counter-scaled to stay at a constant screen-pixel size regardless of zoom.
 */
export function DraggablePoint({
  point,
  index,
  isSelected,
  getPointColor,
  onDragEnd,
  onSelect,
  scale
}: DraggablePointProps): React.ReactElement {
  const pointRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [dragPosition, setDragPosition] = useState({ x: point.xPercent, y: point.yPercent })
  const pointColor = getPointColor(index)

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

  // Drag: track mouse move relative to transformed content, update local state
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      const content = pointRef.current?.closest('.react-transform-component')
      if (!content) return

      const contentRect = content.getBoundingClientRect()
      const newPercentX = Math.max(
        0,
        Math.min(100, ((e.clientX - contentRect.left) / contentRect.width) * 100)
      )
      const newPercentY = Math.max(
        0,
        Math.min(100, ((e.clientY - contentRect.top) / contentRect.height) * 100)
      )
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

  // Counter-scale: the container is sized at BADGE_SIZE * scale in content-coordinates,
  // then scale(1/scale) applied to it yields exactly BADGE_SIZE screen pixels.
  const counterScale = 1 / scale
  const containerSize = BADGE_SIZE * scale
  const halfContainer = containerSize / 2

  return (
    <div
      ref={pointRef}
      style={{
        position: 'absolute',
        left: `${displayX}%`,
        top: `${displayY}%`,
        width: 0,
        height: 0,
        zIndex: isDragging || isSelected ? 1000 : 100
      }}
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
    >
      {/* Counter-scaled wrapper: keeps badge at constant screen-pixel size */}
      <div
        style={{
          position: 'absolute',
          left: -halfContainer,
          top: -halfContainer,
          width: containerSize,
          height: containerSize,
          transform: `scale(${counterScale})`,
          transformOrigin: 'center center',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {/* ── Point Badge ─────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: 'absolute',
            width: BADGE_SIZE,
            height: BADGE_SIZE,
            left: 0,
            top: 0,
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
          animate={
            isSelected
              ? { scale: [1, 1.4, 1] }
              : isHovered && !isDragging
                ? { scale: [1, 1.2, 1] }
                : { scale: 1 }
          }
          transition={{
            duration: isSelected ? 1.4 : 0.8,
            repeat: isSelected || (isHovered && !isDragging) ? Infinity : 0,
            ease: 'easeInOut'
          }}
        >
          {index + 1}
        </motion.div>

        {/* ── Tooltip on hover ────────────────────────────────────────── */}
        {showTooltip && point.text && (
          <Box
            sx={{
              position: 'absolute',
              left: HALF_BADGE,
              top: BADGE_SIZE + 4,
              transform: 'translateX(-50%)',
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
        )}
      </div>
    </div>
  )
}
