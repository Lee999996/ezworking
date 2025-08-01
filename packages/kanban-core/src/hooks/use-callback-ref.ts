import { useCallback, useRef } from 'react'

import { useSafeLayoutEffect } from './use-safe-layout-effect'

/**
 * React hook to persist any value between renders,
 * but keeps it up-to-date if it changes.
 *
 * @param fn the function to persist
 * @param deps the function dependency list
 */
export function useCallbackRef<T extends (...args: any[]) => any>(
  fn: T | undefined,
  deps: React.DependencyList = [],
): T {
  const ref = useRef(fn)

  useSafeLayoutEffect(() => {
    ref.current = fn
  })

  return useCallback(((...args) => ref.current?.(...args)) as T, deps)
}
