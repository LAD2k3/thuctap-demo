import { create } from 'zustand'
import { DEFAULT_GLOBAL_SETTINGS, GlobalSettings, ProjectSettings, ResolvedSettings } from '../types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function mergeSettings(global: GlobalSettings, project?: ProjectSettings | null): ResolvedSettings {
  if (!project) return global
  return {
    autoSave: {
      mode: project.autoSave?.mode ?? global.autoSave.mode,
      intervalSeconds: project.autoSave?.intervalSeconds ?? global.autoSave.intervalSeconds
    },
    prefillNames: project.prefillNames != null ? project.prefillNames : global.prefillNames
  }
}

function deepMergeDefaults(saved: object): GlobalSettings {
  const s = saved as Partial<GlobalSettings>
  return {
    autoSave: {
      mode: s.autoSave?.mode ?? DEFAULT_GLOBAL_SETTINGS.autoSave.mode,
      intervalSeconds:
        s.autoSave?.intervalSeconds ?? DEFAULT_GLOBAL_SETTINGS.autoSave.intervalSeconds
    },
    prefillNames: s.prefillNames ?? DEFAULT_GLOBAL_SETTINGS.prefillNames
  }
}

// ── Store State ──────────────────────────────────────────────────────────────

export interface SettingsState {
  globalSettings: GlobalSettings
  projectSettings: ProjectSettings | null
  ready: boolean
}

// ── Store Actions ─────────────────────────────────────────────────────────────

export interface SettingsActions {
  updateGlobal: (patch: Partial<GlobalSettings>) => void
  updateProject: (patch: ProjectSettings | null) => void
  setProjectSettings: (s: ProjectSettings | null) => void
  loadGlobalSettings: (raw: object) => void
  persistGlobalSettings: (writeFn: (data: GlobalSettings) => void) => void
  getResolved: () => ResolvedSettings
}

export type SettingsStore = SettingsState & SettingsActions

// ── Store Creation ────────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  // State
  globalSettings: DEFAULT_GLOBAL_SETTINGS,
  projectSettings: null,
  ready: false,

  // Actions
  loadGlobalSettings: (raw: object) => {
    set({
      globalSettings: deepMergeDefaults(raw),
      ready: true
    })
  },

  updateGlobal: (patch: Partial<GlobalSettings>) => {
    const current = get().globalSettings
    const next: GlobalSettings = {
      ...current,
      ...patch,
      autoSave: { ...current.autoSave, ...(patch.autoSave ?? {}) }
    }
    set({ globalSettings: next })
  },

  persistGlobalSettings: (writeFn: (data: GlobalSettings) => void) => {
    const { globalSettings } = get()
    writeFn(globalSettings)
  },

  updateProject: (patch: ProjectSettings | null) => {
    set({ projectSettings: patch })
  },

  setProjectSettings: (s: ProjectSettings | null) => {
    set({ projectSettings: s })
  },

  getResolved: () => {
    const { globalSettings, projectSettings } = get()
    return mergeSettings(globalSettings, projectSettings)
  }
}))

// ── Convenience Hook ──────────────────────────────────────────────────────────

export function useSettings() {
  const store = useSettingsStore()
  return {
    globalSettings: store.globalSettings,
    projectSettings: store.projectSettings,
    resolved: store.getResolved(),
    ready: store.ready,
    updateGlobal: store.updateGlobal,
    updateProject: store.updateProject,
    setProjectSettings: store.setProjectSettings,
    loadGlobalSettings: store.loadGlobalSettings,
    persistGlobalSettings: store.persistGlobalSettings
  }
}
