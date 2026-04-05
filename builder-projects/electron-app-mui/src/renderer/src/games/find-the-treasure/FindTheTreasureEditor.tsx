import { Box, Typography } from '@mui/material'
import { useEntityCreateShortcut } from '@renderer/hooks/useEntityCreateShortcut'
import { useSettings } from '@renderer/hooks/useSettings'
import React, { useCallback, useRef, useState } from 'react'
import { FindTheTreasureAnswer, FindTheTreasureAppData, FindTheTreasureStage } from '../../types'
import { StageSidebar, StagesTab } from './components'

interface Props {
  appData: FindTheTreasureAppData
  projectDir: string
  onChange: (data: FindTheTreasureAppData) => void
}

type Tab = 'stages' | 'settings'

function normalize(d: FindTheTreasureAppData): FindTheTreasureAppData {
  return {
    ...d,
    _stageCounter: d._stageCounter ?? 0,
    _answerCounter: d._answerCounter ?? 0,
    stages: d.stages ?? []
  }
}

export default function FindTheTreasureEditor({
  appData: raw,
  projectDir: _projectDir,
  onChange
}: Props): React.ReactElement {
  const data = normalize(raw)
  const [tab, setTab] = useState<Tab>('stages')
  const [activeStageId, setActiveStageId] = useState<string | null>(null)
  const { resolved } = useSettings()
  const { stages } = data
  const stageRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addStage = useCallback(
    (_initialImage?: string) => {
      const sc = data._stageCounter + 1
      const sid = `stage-${sc}`
      const ac = data._answerCounter

      const answers: FindTheTreasureAnswer[] = [
        {
          id: `${sid}-a-${ac + 1}`,
          text: resolved.prefillNames ? `Answer ${ac + 1}` : '',
          isCorrect: true
        },
        {
          id: `${sid}-a-${ac + 2}`,
          text: resolved.prefillNames ? `Answer ${ac + 2}` : '',
          isCorrect: false
        }
      ]

      const stage: FindTheTreasureStage = {
        id: sid,
        stageName: resolved.prefillNames ? `Stage Name ${sc}` : '',
        stageText: resolved.prefillNames ? `Stage Text ${sc}` : '',
        question: resolved.prefillNames ? `Question ${sc}` : '',
        answers,
        stageDescription: resolved.prefillNames ? `Stage Description ${sc}` : '',
        stageValue: 1
      }

      onChange({
        ...data,
        _stageCounter: sc,
        _answerCounter: ac + 2,
        stages: [...stages, stage]
      })

      // Select and scroll to the new stage
      setActiveStageId(sid)
      setTimeout(() => {
        const el = stageRefs.current.get(sid)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    },
    [data, stages, resolved.prefillNames, onChange]
  )

  const addStageFromDrop = useCallback(
    async (_filePath: string) => {
      // find-the-treasure doesn't use images, so just add a stage
      addStage()
    },
    [addStage]
  )

  const updateStage = useCallback(
    (id: string, patch: Partial<FindTheTreasureStage>) => {
      onChange({
        ...data,
        stages: stages.map((s) => (s.id === id ? { ...s, ...patch } : s))
      })
    },
    [data, stages, onChange]
  )

  const deleteStage = useCallback(
    (id: string) => {
      const newStages = stages.filter((s) => s.id !== id)
      onChange({ ...data, stages: newStages })
      if (activeStageId === id) {
        setActiveStageId(null)
      }
    },
    [data, stages, activeStageId, onChange]
  )

  const addAnswer = useCallback(
    (stageId: string) => {
      onChange({
        ...data,
        stages: stages.map((s) => {
          if (s.id !== stageId) return s
          const ac = data._answerCounter + 1
          const newAnswer: FindTheTreasureAnswer = {
            id: `${stageId}-a-${ac}`,
            text: resolved.prefillNames ? `Answer ${ac}` : '',
            isCorrect: false
          }
          return { ...s, answers: [...s.answers, newAnswer] }
        }),
        _answerCounter: data._answerCounter + 1
      })
    },
    [data, stages, resolved.prefillNames, onChange]
  )

  const updateAnswer = useCallback(
    (stageId: string, answerId: string, patch: Partial<FindTheTreasureAnswer>) => {
      onChange({
        ...data,
        stages: stages.map((s) => {
          if (s.id !== stageId) return s
          let answers = s.answers.map((a) => (a.id === answerId ? { ...a, ...patch } : a))

          // If marking as correct and not in multiple-correct mode, uncheck others
          if (patch.isCorrect) {
            answers = answers.map((a) =>
              a.id === answerId ? { ...a, isCorrect: true } : { ...a, isCorrect: false }
            )
          }

          return { ...s, answers }
        })
      })
    },
    [data, stages, onChange]
  )

  const deleteAnswer = useCallback(
    (stageId: string, answerId: string) => {
      onChange({
        ...data,
        stages: stages.map((s) =>
          s.id !== stageId ? s : { ...s, answers: s.answers.filter((a) => a.id !== answerId) }
        )
      })
    },
    [data, stages, onChange]
  )

  // ── Stage selection & scroll ──────────────────────────────────────────────
  const handleStageSelect = useCallback((stageId: string) => {
    setActiveStageId(stageId)
    const el = stageRefs.current.get(stageId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEntityCreateShortcut({
    onTier1: addStage
  })

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <StageSidebar
        tab={tab}
        onTabChange={setTab}
        stages={stages}
        activeStageId={activeStageId}
        onStageSelect={handleStageSelect}
      />

      {/* ── Main ── */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {tab === 'stages' && (
          <StagesTab
            stages={stages}
            onAddStage={addStage}
            onAddStageFromDrop={addStageFromDrop}
            onUpdateStage={updateStage}
            onDeleteStage={deleteStage}
            onAddAnswer={addAnswer}
            onUpdateAnswer={updateAnswer}
            onDeleteAnswer={deleteAnswer}
          />
        )}
        {tab === 'settings' && (
          <Box>
            <Typography variant="h6" sx={{ color: 'common.white', mb: 2 }}>
              Settings
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No settings available for this game yet.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Invisible refs for scroll-to-stage */}
      {stages.map((s) => (
        <div
          key={s.id}
          ref={(el) => {
            if (el) stageRefs.current.set(s.id, el)
            else stageRefs.current.delete(s.id)
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1,
            height: 1,
            pointerEvents: 'none'
          }}
        />
      ))}
    </Box>
  )
}
