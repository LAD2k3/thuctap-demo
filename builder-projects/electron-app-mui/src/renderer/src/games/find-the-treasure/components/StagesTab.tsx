import AddIcon from '@mui/icons-material/Add'
import IslandsIcon from '@mui/icons-material/Terrain'
import { Alert, Box, Button, Collapse } from '@mui/material'
import React from 'react'
import { EmptyState, FileDropTarget, StickyHeader } from '../../../components/editors'
import { FindTheTreasureAnswer, FindTheTreasureStage } from '../../../types'
import { StageCard } from './StageCard'

export interface StagesTabProps {
  stages: FindTheTreasureStage[]
  onAddStage: (initialImage?: string) => void
  onAddStageFromDrop: (filePath: string) => void
  onUpdateStage: (id: string, patch: Partial<FindTheTreasureStage>) => void
  onDeleteStage: (id: string) => void
  onAddAnswer: (stageId: string) => void
  onUpdateAnswer: (stageId: string, answerId: string, patch: Partial<FindTheTreasureAnswer>) => void
  onDeleteAnswer: (stageId: string, answerId: string) => void
}

export function StagesTab({
  stages,
  onAddStage,
  onAddStageFromDrop,
  onUpdateStage,
  onDeleteStage,
  onAddAnswer,
  onUpdateAnswer,
  onDeleteAnswer
}: StagesTabProps): React.ReactElement {
  // Validation
  const noName = stages.filter((s) => !s.stageName.trim())
  const noText = stages.filter((s) => !s.stageText.trim())
  const noQuestion = stages.filter((s) => !s.question.trim())
  const noCorrect = stages.filter((s) => !s.answers.some((a) => a.isCorrect))
  const emptyAnswers = stages.filter((s) => s.answers.some((a) => !a.text.trim()))
  const tooFewAns = stages.filter((s) => s.answers.length < 2)
  const noDescription = stages.filter((s) => !s.stageDescription.trim())
  const hasIssues =
    noName.length > 0 ||
    noText.length > 0 ||
    noQuestion.length > 0 ||
    noCorrect.length > 0 ||
    emptyAnswers.length > 0 ||
    tooFewAns.length > 0 ||
    noDescription.length > 0

  return (
    <Box>
      <Collapse in={hasIssues}>
        <Alert severity="warning" sx={{ mb: 2, fontSize: '0.8rem' }}>
          {[
            noName.length > 0 && `${noName.length} stage(s) missing a name`,
            noText.length > 0 && `${noText.length} stage(s) missing stage text`,
            noQuestion.length > 0 && `${noQuestion.length} stage(s) missing a question`,
            noCorrect.length > 0 && `${noCorrect.length} stage(s) have no correct answer marked`,
            emptyAnswers.length > 0 && `${emptyAnswers.length} stage(s) have blank answer text`,
            tooFewAns.length > 0 && `${tooFewAns.length} stage(s) need at least 2 answers`,
            noDescription.length > 0 && `${noDescription.length} stage(s) missing a description`
          ]
            .filter(Boolean)
            .join(' · ')}
        </Alert>
      </Collapse>

      <StickyHeader
        title="Stages"
        description="Each stage has a location, story, question with answers, and explanation."
        actions={
          <FileDropTarget onFileDrop={onAddStageFromDrop}>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => onAddStage()}
            >
              Add Stage
            </Button>
          </FileDropTarget>
        }
      />

      {stages.length === 0 ? (
        <EmptyState
          icon={<IslandsIcon sx={{ fontSize: 48, opacity: 0.3 }} />}
          title="No stages yet"
          description='Click "Add Stage" to create your first island stage.'
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {stages.map((s, idx) => (
            <StageCard
              key={s.id}
              stage={s}
              index={idx}
              autoFocus={idx === stages.length - 1}
              onUpdateStage={onUpdateStage}
              onDeleteStage={onDeleteStage}
              onAddAnswer={onAddAnswer}
              onUpdateAnswer={onUpdateAnswer}
              onDeleteAnswer={onDeleteAnswer}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}
