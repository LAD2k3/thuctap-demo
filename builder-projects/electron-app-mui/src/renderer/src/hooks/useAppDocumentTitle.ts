import { useDocumentTitle } from 'usehooks-ts'

/**
 * Custom hook that sets the document title.
 * @param {string} title - The title to set.
 * @public
 * @example
 * ```tsx
 * useAppDocumentTitle('My new title');
 * ```
 */
export function useAppDocumentTitle(title: string): void {
  useDocumentTitle(`Minigame Builder — ${title}`, { preserveTitleOnUnmount: false })
}
