import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import type { GlobalSettings, ProjectSettings, ResolvedSettings } from '../types'

// ── Context types ─────────────────────────────────────────────────────────────

interface SettingsContextValue {
  /** Raw global settings (for displaying / editing) */
  globalSettings: GlobalSettings
  /** Current per-project overrides */
  projectSettings: ProjectSettings | null
  /** Merged effective settings */
  resolved: ResolvedSettings
  /** Whether global settings have been loaded from disk */
  ready: boolean

  updateGlobal: (patch: Partial<GlobalSettings>) => void
  updateProject: (patch: ProjectSettings | null) => void

  /**
   * Call this from ProjectPage to plug in per-project settings.
   * Pass null when leaving the project page.
   */
  setProjectSettings: (s: ProjectSettings | null) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function SettingsProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const store = useSettingsStore()
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load global settings from disk on mount
  useEffect(() => {
    window.electronAPI.settingsReadGlobal().then((raw) => {
      store.loadGlobalSettings(raw)
    })
  }, [store])

  const updateGlobal = useCallback(
    (patch: Partial<GlobalSettings>) => {
      store.updateGlobal(patch)
      // Debounce persist
      if (persistTimer.current) clearTimeout(persistTimer.current)
      persistTimer.current = setTimeout(() => {
        store.persistGlobalSettings((data) => {
          window.electronAPI.settingsWriteGlobal(data)
        })
      }, 500)
    },
    [store]
  )

  const updateProject = useCallback(
    (patch: ProjectSettings | null) => {
      store.updateProject(patch)
    },
    [store]
  )

  const setProjectSettings = useCallback(
    (s: ProjectSettings | null) => {
      store.setProjectSettings(s)
    },
    [store]
  )

  return (
    <SettingsContext.Provider
      value={{
        globalSettings: store.globalSettings,
        projectSettings: store.projectSettings,
        resolved: store.getResolved(),
        ready: store.ready,
        updateGlobal,
        updateProject,
        setProjectSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>')
  return ctx
}
