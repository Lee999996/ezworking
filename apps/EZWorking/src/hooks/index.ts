/**
 * Hooks Export Module
 * 
 * This module exports all custom hooks for the AI chat system.
 * It provides a centralized access point for all React hooks.
 */

// Authentication hooks
export { useAuth, useRequireAuth, useAuthStateListener } from './useAuth'

// Chat management hooks
export { useChat } from './useChat'
export { useChatHistory } from './useChatHistory'

// Type exports for hook return types
export type { UseAuthReturn } from './useAuth'
export type { 
  UseChatReturn, 
  UseChatHistoryReturn 
} from '../types/chat'