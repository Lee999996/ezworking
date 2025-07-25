import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth as useSaasUIAuth } from '@saas-ui/auth'
import type { User } from '@supabase/supabase-js'

export interface UseAuthReturn {
  // User state
  user: User | null
  userId: string | null
  isAuthenticated: boolean
  loading: boolean
  
  // Auth actions
  redirectToLogin: () => void
  handleAuthStateChange: (callback: (user: User | null) => void) => () => void
  
  // Error state
  authError: string | null
  clearAuthError: () => void
}

/**
 * Custom hook for authentication integration with chat system
 * Implements requirements: 1.1, 1.2, 1.3
 * - 确保聊天功能与现有认证系统集成
 * - 实现未登录用户的重定向逻辑
 * - 添加用户状态变化的响应处理
 */
export function useAuth(): UseAuthReturn {
  // Use the existing SaasUI auth hook
  const { 
    user: saasUIUser, 
    isAuthenticated: saasUIIsAuthenticated, 
    isLoading: saasUIIsLoading 
  } = useSaasUIAuth()

  // Local state management
  const [authError, setAuthError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Refs for cleanup and callback management
  const isMounted = useRef(true)
  const authCallbacks = useRef<Set<(user: User | null) => void>>(new Set())
  const router = useRouter()

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false
      authCallbacks.current.clear()
    }
  }, [])

  /**
   * Initialize auth state
   */
  useEffect(() => {
    if (!saasUIIsLoading && !isInitialized) {
      setIsInitialized(true)
    }
  }, [saasUIIsLoading, isInitialized])

  /**
   * Handle auth state changes and notify callbacks
   * Requirement 1.3: 用户状态变化的响应处理
   */
  useEffect(() => {
    if (!isInitialized) return

    // Notify all registered callbacks about auth state change
    authCallbacks.current.forEach(callback => {
      try {
        callback(saasUIUser as User | null)
      } catch (error) {
        console.error('Error in auth state change callback:', error)
      }
    })
  }, [saasUIUser, isInitialized])

  /**
   * Redirect to login page
   * Requirement 1.2: 未登录用户的重定向逻辑
   */
  const redirectToLogin = useCallback(() => {
    if (!isMounted.current) return

    try {
      // Store the current path to redirect back after login
      const currentPath = window.location.pathname + window.location.search
      const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`
      
      router.push(loginUrl)
    } catch (error) {
      console.error('Failed to redirect to login:', error)
      setAuthError('重定向到登录页面失败')
      
      // Fallback: try direct navigation
      try {
        window.location.href = '/login'
      } catch (fallbackError) {
        console.error('Fallback redirect also failed:', fallbackError)
      }
    }
  }, [router])

  /**
   * Register callback for auth state changes
   * Requirement 1.3: 用户状态变化的响应处理
   */
  const handleAuthStateChange = useCallback((callback: (user: User | null) => void) => {
    if (!isMounted.current) {
      return () => {} // Return empty cleanup function
    }

    // Add callback to the set
    authCallbacks.current.add(callback)

    // Call immediately with current state if initialized
    if (isInitialized) {
      try {
        callback(saasUIUser as User | null)
      } catch (error) {
        console.error('Error in immediate auth callback:', error)
      }
    }

    // Return cleanup function
    return () => {
      authCallbacks.current.delete(callback)
    }
  }, [saasUIUser, isInitialized])

  /**
   * Clear auth error
   */
  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  /**
   * Auto-redirect unauthenticated users from protected routes
   * Requirement 1.1: 未登录用户访问聊天页面时的处理
   */
  useEffect(() => {
    if (!isInitialized || saasUIIsLoading) return

    // Check if we're on a protected route (chat pages)
    const currentPath = window.location.pathname
    const isProtectedRoute = currentPath.startsWith('/chat') || 
                           currentPath.startsWith('/dashboard')

    // If user is not authenticated and on a protected route, redirect to login
    if (!saasUIIsAuthenticated && isProtectedRoute) {
      console.log('Unauthenticated user on protected route, redirecting to login')
      redirectToLogin()
    }
  }, [saasUIIsAuthenticated, isInitialized, saasUIIsLoading, redirectToLogin])

  /**
   * Handle authentication errors from SaasUI
   */
  useEffect(() => {
    // Monitor for authentication errors
    // This is a placeholder for potential error handling from SaasUI auth
    // In a real implementation, you might want to listen to auth errors
    // from the Supabase client or SaasUI auth provider
  }, [])

  // Compute derived values
  const user = saasUIUser as User | null
  const userId = user?.id || null
  const isAuthenticated = saasUIIsAuthenticated && !!user
  const loading = saasUIIsLoading || !isInitialized

  return {
    // User state
    user,
    userId,
    isAuthenticated,
    loading,
    
    // Auth actions
    redirectToLogin,
    handleAuthStateChange,
    
    // Error state
    authError,
    clearAuthError
  }
}

/**
 * Hook for protecting components that require authentication
 * Requirement 1.1: 确保只有登录用户才能使用对话功能
 */
export function useRequireAuth(): UseAuthReturn {
  const auth = useAuth()
  const { isAuthenticated, loading, redirectToLogin } = auth

  useEffect(() => {
    // Only redirect if we're done loading and user is not authenticated
    if (!loading && !isAuthenticated) {
      redirectToLogin()
    }
  }, [loading, isAuthenticated, redirectToLogin])

  return auth
}

/**
 * Hook for components that need to react to auth state changes
 * Requirement 1.3: 用户状态变化的响应处理
 */
export function useAuthStateListener(
  onAuthChange: (user: User | null) => void,
  deps: React.DependencyList = []
): void {
  const { handleAuthStateChange } = useAuth()

  useEffect(() => {
    const cleanup = handleAuthStateChange(onAuthChange)
    return cleanup
  }, [handleAuthStateChange, ...deps])
}