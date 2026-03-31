import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react'
import { createStore, useStore } from 'zustand'
import { travel } from 'zustand-travel'
import { AnyAppData } from '../types'

// ── Store Type ────────────────────────────────────────────────────────────────
export type HistoryStore = ReturnType<typeof createHistoryStore>

// ── Store Factory ─────────────────────────────────────────────────────────────
/**
 * Creates a scoped history store with time-travel capabilities.
 * Uses zustand-travel middleware for automatic undo/redo management.
 *
 * The `set` function from travel middleware tracks state changes for history.
 * We expose a custom setState action that uses this `set` function.
 */
const createHistoryStore = (initialState: AnyAppData) => {
  return createStore<AnyAppData & { setState: (newState: AnyAppData) => void }>()(
    travel(
      (set) => ({
        ...initialState,
        setState: (newState: AnyAppData) => {
          set(() => newState)
        }
      }),
      {
        maxHistory: 50,
        autoArchive: true
      }
    )
  )
}

// ── Context ───────────────────────────────────────────────────────────────────
const ProjectHistoryContext = createContext<HistoryStore | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────
interface ProjectHistoryProviderProps {
  children: ReactNode
  initialState: AnyAppData
}

export function ProjectHistoryProvider({ children, initialState }: ProjectHistoryProviderProps) {
  const [store] = useState(() => createHistoryStore(initialState))

  return <ProjectHistoryContext.Provider value={store}>{children}</ProjectHistoryContext.Provider>
}

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * Direct access to the scoped travel store.
 * Each ProjectHistoryProvider instance has its own isolated history state.
 *
 * @example
 * const { state, setState, controls, canBack, canForward } = useProjectHistory()
 * controls.back()   // undo
 * controls.forward() // redo
 */
export function useProjectHistory() {
  const store = useContext(ProjectHistoryContext)
  if (store === null) {
    throw new Error('useProjectHistory must be used within a ProjectHistoryProvider')
  }

  // Subscribe to store changes - triggers re-renders when state changes
  const state = useStore(store, (s) => s)

  // Get travel controls (stable reference)
  const controls = store.getControls()
  
  // Subscribe to control state changes for reactive UI
  const canBack = useStore(store, () => controls.canBack())
  const canForward = useStore(store, () => controls.canForward())
  const position = useStore(store, () => controls.position)

  return {
    state,
    setState: state.setState,
    controls,
    store,
    canBack,
    canForward,
    position
  }
}

// ── Hook with debounced push ──────────────────────────────────────────────────
interface UseProjectHistoryWithDebounceOptions {
  /** Debounce delay in ms (default: 500ms) */
  debounceMs?: number
}

/**
 * useProjectHistory with debounced state pushes.
 * Useful for rapid edits (e.g., typing) where you don't want every keystroke in history.
 *
 * Maintains a local `current` ref that updates immediately for UI responsiveness,
 * while the history store is updated after debounce.
 *
 * @example
 * const { current, push, controls } = useProjectHistoryWithDebounce({ debounceMs: 500 })
 * push(newData) // Will be debounced
 */
export function useProjectHistoryWithDebounce(options: UseProjectHistoryWithDebounceOptions = {}) {
  const { debounceMs = 500 } = options
  const { setState, controls, store, canBack, canForward, position } = useProjectHistory()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = useRef<AnyAppData | null>(null)

  // Keep a ref of the latest state for immediate access (not waiting for debounce)
  const currentRef = useRef<AnyAppData>(store.getState())

  // Subscribe to store changes to keep currentRef updated
  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      currentRef.current = newState
    })
    return unsubscribe
  }, [store])

  const push = useCallback(
    (newState: AnyAppData) => {
      pendingRef.current = newState

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        const pending = pendingRef.current
        if (pending) {
          setState(pending)
          pendingRef.current = null
        }
      }, debounceMs)
    },
    [setState, debounceMs]
  )

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    },
    [debounceMs]
  )

  return {
    current: currentRef.current,
    push,
    setState,
    controls,
    store,
    canBack,
    canForward,
    position
  }
}

// ── Helper: Get full history array ────────────────────────────────────────────
/**
 * Get the full history array from travel controls.
 * Useful for saving/exporting the complete undo/redo stack.
 */
export function getHistoryArray(store: HistoryStore): AnyAppData[] {
  const controls = store.getControls()
  return controls.getHistory() as unknown as AnyAppData[]
}
