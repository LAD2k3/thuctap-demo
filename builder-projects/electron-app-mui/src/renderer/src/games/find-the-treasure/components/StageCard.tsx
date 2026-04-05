import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import {
    Box,
    Button,
    IconButton,
    TextField,
    Tooltip,
    Typography
} from '@mui/material'
import React from 'react'
import { FindTheTreasureAnswer, FindTheTreasureStage } from '../../../types'

export interface StageCardProps {
  stage: FindTheTreasureStage
  index: number
  autoFocus: boolean
  onUpdateStage: (id: string, patch: Partial<FindTheTreasureStage>) => void
  onDeleteStage: (id: string) => void
  onAddAnswer: (stageId: string) => void
  onUpdateAnswer: (stageId: string, answerId: string, patch: Partial<FindTheTreasureAnswer>) => void
  onDeleteAnswer: (stageId: string, answerId: string) => void
}

export function StageCard({
  stage,
  index,
  autoFocus,
  onUpdateStage,
  onDeleteStage,
  onAddAnswer,
  onUpdateAnswer,
  onDeleteAnswer
}: StageCardProps): React.ReactElement {
  const hasCorrectAnswer = stage.answers.some((a) => a.isCorrect)

  return (
    <Box
      sx={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 3,
        background: 'rgba(255,255,255,0.02)',
        overflow: 'hidden'
      }}
    >
      {/* ── Card Header ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.03)'
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5 }}
        >
          Stage {index + 1}
        </Typography>
        <Tooltip title="Delete stage">
          <IconButton
            size="small"
            onClick={() => onDeleteStage(stage.id)}
            sx={{ color: 'error.main', opacity: 0.5, '&:hover': { opacity: 1 } }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Card Body ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
        {/* Stage Name */}
        <TextField
          label="Stage Name"
          size="small"
          fullWidth
          value={stage.stageName}
          onChange={(e) => onUpdateStage(stage.id, { stageName: e.target.value })}
          placeholder="e.g. Coral Island"
          error={!stage.stageName.trim()}
          helperText={!stage.stageName.trim() ? 'Required' : ''}
          autoFocus={autoFocus}
        />

        {/* Stage Text (story) */}
        <TextField
          label="Stage Text"
          size="small"
          fullWidth
          multiline
          minRows={2}
          value={stage.stageText}
          onChange={(e) => onUpdateStage(stage.id, { stageText: e.target.value })}
          placeholder="A short backstory paragraph for this stage..."
          error={!stage.stageText.trim()}
          helperText={!stage.stageText.trim() ? 'Required' : ''}
        />

        {/* Question */}
        <TextField
          label="Question"
          size="small"
          fullWidth
          value={stage.question}
          onChange={(e) => onUpdateStage(stage.id, { question: e.target.value })}
          placeholder="The quiz question for this stage..."
          error={!stage.question.trim()}
          helperText={!stage.question.trim() ? 'Required' : ''}
        />

        {/* Answers */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            variant="overline"
            sx={{ fontSize: '0.6rem', letterSpacing: 2, color: 'text.disabled' }}
          >
            Answers — click the icon to mark as correct
          </Typography>

          {stage.answers.map((answer, aIdx) => {
            const isCorrect = answer.isCorrect
            const Icon = isCorrect ? CheckCircleIcon : RadioButtonUncheckedIcon

            return (
              <Box key={answer.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={isCorrect ? 'Correct (click to toggle)' : 'Mark as correct'}>
                  <IconButton
                    size="small"
                    onClick={() => onUpdateAnswer(stage.id, answer.id, { isCorrect: !isCorrect })}
                    sx={{
                      color: isCorrect ? 'success.main' : 'text.disabled',
                      flexShrink: 0
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <TextField
                  size="small"
                  fullWidth
                  value={answer.text}
                  onChange={(e) => onUpdateAnswer(stage.id, answer.id, { text: e.target.value })}
                  placeholder={`Answer ${String.fromCharCode(64 + aIdx + 1)}…`}
                  error={!answer.text.trim()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderColor: isCorrect ? 'success.main' : undefined,
                      '& fieldset': { borderColor: isCorrect ? 'rgba(52,211,153,0.4)' : undefined }
                    }
                  }}
                />

                <Tooltip title="Remove answer">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => onDeleteAnswer(stage.id, answer.id)}
                      disabled={stage.answers.length <= 2}
                      sx={{
                        color: 'error.main',
                        opacity: 0.5,
                        '&:hover': { opacity: 1 },
                        '&.Mui-disabled': { opacity: 0.2 }
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            )
          })}

          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => onAddAnswer(stage.id)}
            sx={{ alignSelf: 'flex-start', mt: 0.5, opacity: 0.7 }}
          >
            Add answer
          </Button>

          {!hasCorrectAnswer && stage.answers.length > 0 && (
            <Typography variant="caption" color="warning.main" sx={{ mt: 0.25 }}>
              ⚠ No correct answer marked
            </Typography>
          )}
        </Box>

        {/* Stage Description (explanation) */}
        <TextField
          label="Stage Description"
          size="small"
          fullWidth
          multiline
          minRows={2}
          value={stage.stageDescription}
          onChange={(e) => onUpdateStage(stage.id, { stageDescription: e.target.value })}
          placeholder="Explanation shown after the player answers..."
          error={!stage.stageDescription.trim()}
          helperText={!stage.stageDescription.trim() ? 'Required' : ''}
        />

        {/* Stage Value (points) */}
        <TextField
          label="Stage Value"
          size="small"
          type="number"
          value={stage.stageValue}
          onChange={(e) => {
            const val = Math.max(0, parseInt(e.target.value, 10) || 0)
            onUpdateStage(stage.id, { stageValue: val })
          }}
          inputProps={{ min: 0 }}
          sx={{ maxWidth: 140 }}
        />
      </Box>
    </Box>
  )
}
