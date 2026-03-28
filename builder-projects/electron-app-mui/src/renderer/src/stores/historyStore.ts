import { create } from 'zustand'
import { travel } from 'zustand-travel'

const MAX_HISTORY = 50

export interface HistoryState<T extends object> {
  present: T
  past: T[]
  future: T[]
}

export interface HistoryActions<T extends object> {
  set: (value: T) => void
  undo: () => void
  redo: () => void
  reset: (value: T) => void
  getReachableStates: () => T[]
}

export type HistoryStore<T extends object> = HistoryState<T> & HistoryActions<T>

/**
 * Creates a zustand-based history store with undo/redo support using zustand-travel.
 * This replaces the fast-json-patch based implementation with a simpler snapshot-based approach.
 */
export function createHistoryStore<T extends object>(initial: T) {
  return create<HistoryStore<T>>()(
    travel(
      (set, get) => ({
        present: initial,
        past: [],
        future: [],

        set: (value: T) => {
          const { present, past } = get()
          
          // Don't push if value is the same as present
          if (JSON.stringify(present) === JSON.stringify(value)) {
            return
          }

          const newPast = [...past, present]
          const trimmedPast =
            newPast.length > MAX_HISTORY ? newPast.slice(newPast.length - MAX_HISTORY) : newPast

          set({
            present: value,
            past: trimmedPast,
            future: []
          })
        },

        undo: () => {
          const { past, present, future } = get()
          if (past.length === 0) return

          const previous = past[past.length - 1]
          const newPast = past.slice(0, past.length - 1)

          set({
            present: previous,
            past: newPast,
            future: [present, ...future]
          })
        },

        redo: () => {
          const { future, present, past } = get()
          if (future.length === 0) return

          const next = future[0]
          const newFuture = future.slice(1)

          set({
            present: next,
            past: [...past, present],
            future: newFuture
          })
        },

        reset: (value: T) => {
          set({
            present: value,
            past: [],
            future: []
          })
        },

        getReachableStates: () => {
          const { past, present, future } = get()
          return [...past, present, ...future]
        }
      }),
      {
        // Options for travels
        maxHistory: MAX_HISTORY
      }
    )
  )
}

// Type helper to extract the store type
export type HistoryStoreType<T extends object> = ReturnType<typeof createHistoryStore<T>>
