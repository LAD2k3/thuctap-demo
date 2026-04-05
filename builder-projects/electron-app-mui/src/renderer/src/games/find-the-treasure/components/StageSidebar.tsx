import CollectionsIcon from '@mui/icons-material/Collections'
import SettingsIcon from '@mui/icons-material/Settings'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { Box, Chip, Divider, Typography } from '@mui/material'
import React from 'react'
import { SidebarTab } from '../../../components/editors'
import { FindTheTreasureStage } from '../../../types'

export type Tab = 'stages' | 'settings'

export interface StageSidebarProps {
  tab: Tab
  onTabChange: (tab: Tab) => void
  stages: FindTheTreasureStage[]
  activeStageId: string | null
  onStageSelect: (stageId: string) => void
}

export function StageSidebar({
  tab,
  onTabChange,
  stages,
  activeStageId,
  onStageSelect
}: StageSidebarProps): React.ReactElement {
  // Validation counts
  const stagesWithIssues = stages.filter((s) => {
    const hasCorrectAnswer = s.answers.some((a) => a.isCorrect)
    return (
      !s.stageName.trim() ||
      !s.stageText.trim() ||
      !s.question.trim() ||
      !s.stageDescription.trim() ||
      !hasCorrectAnswer ||
      s.answers.some((a) => !a.text.trim()) ||
      s.answers.length < 2
    )
  })

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        background: '#13161f',
        p: 2,
        gap: 1,
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* ── Top: Navigation Tabs (static) ── */}
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ letterSpacing: 2, fontSize: '0.65rem' }}
      >
        Sections
      </Typography>
      <SidebarTab
        active={tab === 'stages'}
        onClick={() => onTabChange('stages')}
        icon={<CollectionsIcon fontSize="small" />}
        label="Stages"
        badge={stages.length}
        badgeColor={stagesWithIssues.length > 0 ? 'error' : 'default'}
      />
      <SidebarTab
        active={tab === 'settings'}
        onClick={() => onTabChange('settings')}
        icon={<SettingsIcon fontSize="small" />}
        label="Settings"
        badge={0}
        badgeColor="default"
      />

      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* ── Middle: Scrollable Stage List ── */}
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ letterSpacing: 2, fontSize: '0.65rem' }}
      >
        Stages
      </Typography>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          minHeight: 0
        }}
      >
        {stages.length === 0 ? (
          <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', py: 2 }}>
            No stages yet
          </Typography>
        ) : (
          stages.map((s, idx) => {
            const hasCorrectAnswer = s.answers.some((a) => a.isCorrect)
            const hasIssue =
              !s.stageName.trim() ||
              !s.stageText.trim() ||
              !s.question.trim() ||
              !s.stageDescription.trim() ||
              !hasCorrectAnswer ||
              s.answers.some((a) => !a.text.trim()) ||
              s.answers.length < 2

            return (
              <SidebarTab
                key={s.id}
                active={s.id === activeStageId}
                onClick={() => onStageSelect(s.id)}
                icon={null}
                label={s.stageName || `Stage ${idx + 1}`}
                badge={idx + 1}
                badgeColor={hasIssue ? 'error' : 'default'}
              />
            )
          })
        )}
      </Box>

      {/* ── Bottom: Summary (pinned, always visible) ── */}
      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ letterSpacing: 2, fontSize: '0.65rem' }}
      >
        Summary
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <SummaryRow label="Total stages" value={stages.length} />
        <SummaryRow
          label="Total answers"
          value={stages.reduce((sum, s) => sum + s.answers.length, 0)}
        />
        {stagesWithIssues.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
            <Typography variant="caption" color="warning.main">
              {stagesWithIssues.length} stage(s) with issues
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }): React.ReactElement {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Chip
        label={value}
        size="small"
        sx={{ height: 16, fontSize: '0.65rem', minWidth: 24 }}
        color={value === 0 ? 'default' : 'primary'}
      />
    </Box>
  )
}
