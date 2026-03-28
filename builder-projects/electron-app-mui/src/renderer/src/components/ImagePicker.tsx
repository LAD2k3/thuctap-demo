import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import ClearIcon from '@mui/icons-material/Clear'
import BrokenImageIcon from '@mui/icons-material/BrokenImage'
import { Box, CircularProgress, IconButton, SxProps, Tooltip, Typography } from '@mui/material'
import React, { useContext, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { AssetTrackerContext } from '../context/AssetTrackerContext'
import { useAssetUrl } from '../hooks/useAssetUrl'

interface Props {
  projectDir: string
  desiredNamePrefix: string
  value: string | null
  onChange: (relativePath: string | null) => void
  label?: string
  size?: number
  sx?: SxProps
}

export default function ImagePicker({
  projectDir,
  desiredNamePrefix,
  value,
  onChange,
  label,
  size = 100,
  sx
}: Props): React.ReactElement {
  const [loading, setLoading] = useState(false)
  const [imgError, setImgError] = useState(false)
  const { data: url } = useAssetUrl(projectDir, value)
  const trackAsset = useContext(AssetTrackerContext)

  // Reset error when URL changes
  React.useEffect(() => {
    setImgError(false)
  }, [url])

  const importFile = async (filePath: string): Promise<void> => {
    setLoading(true)
    try {
      const relativePath = await window.electronAPI.importImage(
        filePath,
        projectDir,
        desiredNamePrefix
      )
      trackAsset(relativePath)
      onChange(relativePath)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = async (): Promise<void> => {
    const picked = await window.electronAPI.pickImage()
    if (picked) await importFile(picked)
  }

  const handleClear = (e: React.MouseEvent): void => {
    e.stopPropagation()
    onChange(null)
  }

  // ── Drag & drop support ──────────────────────────────────────────────────
  const { getRootProps, isDragActive } = useDropzone({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onDrop: (acceptedFiles: any[], _rejections, event: any) => {
      event?.stopPropagation()
      const file = acceptedFiles.find((f) => f.type?.startsWith('image/'))
      if (file) {
        importFile(window.electronAPI.getPathForFile(file))
      }
    },
    onDragEnter: (e) => e.stopPropagation(),
    onDragOver: (e) => e.stopPropagation(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getFilesFromEvent: (event: any): any => {
      const files = event.dataTransfer?.files
      return files ? Array.from(files) : []
    },
    disabled: loading,
    accept: { 'image/*': [] }
  })

  const isActive = isDragActive && !loading

  return (
    <Tooltip
      title={
        value ? 'Click to change image · Drop image here' : 'Click to add image · Drop image here'
      }
    >
      <Box
        {...getRootProps()}
        onClick={(e) => {
          // react-dropzone handles click by default, but we have a custom handleClick
          // that uses electronAPI.pickImage. We should probably keep our custom one
          // but call it from here or let dropzone handle it.
          // Let's use dropzone's built-in click if possible, or keep our handleClick.
          // Since we use electronAPI.pickImage, our handleClick is better.
          e.stopPropagation()
          handleClick()
        }}
        sx={[
          {
            width: size,
            height: size,
            borderRadius: 2,
            border: '2px dashed',
            borderColor: isActive
              ? 'primary.main'
              : value
                ? 'primary.dark'
                : 'rgba(255,255,255,0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            background: isActive
              ? 'rgba(110,231,183,0.08)'
              : value
                ? 'transparent'
                : 'rgba(255,255,255,0.02)',
            transition: 'border-color 0.15s, background 0.15s',
            flexShrink: 0,
            '&:hover': { borderColor: 'primary.main', background: 'rgba(110,231,183,0.04)' }
          },
          ...(Array.isArray(sx) ? sx : [sx])
        ]}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : url ? (
          <>
            {imgError ? (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(239,68,68,0.1)',
                  color: '#ef4444'
                }}
              >
                <BrokenImageIcon sx={{ fontSize: size * 0.32, opacity: 0.8 }} />
                <Typography
                  variant="caption"
                  sx={{ mt: 0.5, fontSize: '0.65rem', fontWeight: 600 }}
                >
                  Asset Missing
                </Typography>
              </Box>
            ) : (
              <Box
                component="img"
                src={url}
                alt={label ?? 'asset'}
                onError={() => setImgError(true)}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <IconButton
              size="small"
              onClick={handleClear}
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                padding: '2px',
                '&:hover': { background: 'rgba(248,113,113,0.8)' }
              }}
            >
              <ClearIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </>
        ) : (
          <>
            <AddPhotoAlternateIcon
              sx={{
                fontSize: size * 0.32,
                color: isActive ? 'primary.main' : 'rgba(255,255,255,0.25)'
              }}
            />
            {label && (
              <Typography
                variant="caption"
                sx={{
                  color: isActive ? 'primary.main' : 'rgba(255,255,255,0.35)',
                  fontSize: '0.65rem',
                  mt: 0.5,
                  textAlign: 'center',
                  px: 0.5,
                  lineHeight: 1.2
                }}
              >
                {isActive ? 'Drop!' : label}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Tooltip>
  )
}
