import log from 'electron-log/renderer'
import { useEffect, useRef } from 'react'
import { createHistoryStore, HistoryStoreType } from '../stores/historyStore'

export interface HistoryState<T extends object> {
  present: T
  canUndo: boolean
  canRedo: boolean
  push: (next: T) => void
  undo: () => void
  redo: () => void
  reset: (next: T) => void
  getReachableStates: () => T[]
}

/**
 * Hook-based wrapper around the zustand history store.
 * This provides a simple API for undo/redo functionality using snapshot-based history.
 */
export function useProjectHistory<T extends object>(initial: T): HistoryState<T> {
  const storeRef = useRef<HistoryStoreType<T> | null>(null)
  
  // Initialize store once
  if (!storeRef.current) {
    storeRef.current = createHistoryStore<T>(initial)
  }

  const store = storeRef.current

  // Sync initial value if it changes (e.g., loading a new file)
  useEffect(() => {
    const state = store.getState()
    // Only reset if the initial value is different and we have no history
    if (state.past.length === 0 && state.future.length === 0) {
      store.getState().reset(initial)
    } else if (JSON.stringify(state.present) !== JSON.stringify(initial)) {
      // If loading a completely different project, reset
      // This is a simple heuristic - in practice, ProjectPage should handle this
      store.getState().reset(initial)
    }
  }, [initial, store])

  const push = (next: T) => {
    log.debug('useProjectHistory: pushing new state')
    store.getState().set(next)
  }

  const undo = () => {
    log.info('useProjectHistory: undo')
    store.getState().undo()
  }

  const redo = () => {
    log.info('useProjectHistory: redo')
    store.getState().redo()
  }

  const reset = (next: T) => {
    log.info('useProjectHistory: reset')
    store.getState().reset(next)
  }

  const getReachableStates = () => {
    return store.getState().getReachableStates()
  }

  // Subscribe to state changes for canUndo/canRedo and present
  const present = store((state) => state.present)
  const canUndo = store((state) => state.past.length > 0)
  const canRedo = store((state) => state.future.length > 0)

  return {
    present,
    canUndo,
    canRedo,
    push,
    undo,
    redo,
    reset,
    getReachableStates
  }
}
