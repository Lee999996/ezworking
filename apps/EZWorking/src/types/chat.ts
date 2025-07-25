// Core Chat System Types and Interfaces

// ============================================================================
// Message Types
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'ai';
export type ComponentType = 'text' | 'image' | 'file' | 'code' | 'table';

/**
 * Core chat message interface used throughout the application
 */
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'component';
  content: string;
  componentType?: ComponentType;
  componentData?: any;
  timestamp: Date;
  userId?: string;
  status?: 'sending' | 'sent' | 'failed';
  retryCount?: number;
}

/**
 * Message format for database storage and API communication
 * Follows the specified format: messages=[{'role': 'user', 'content': content}, ...]
 */
export interface ChatHistoryMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// ============================================================================
// Session Types
// ============================================================================



/**
 * Chat session interface representing a conversation thread
 */
export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  messages: ChatHistoryMessage[];
  created_at: Date;
  updated_at: Date;
  status?: 'active' | 'archived' | 'deleted';
}

/**
 * Simplified session interface for list displays
 */
export interface ChatSessionSummary {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
  messageCount: number;
  lastMessage?: string;
}

// ============================================================================
// Service Interfaces
// ============================================================================

/**
 * Main chat service interface for managing conversations
 */
export interface ChatService {
  // Session Management
  createSession(userId: string, title?: string): Promise<string>;
  getSession(sessionId: string): Promise<ChatSession | null>;
  getUserSessions(userId: string): Promise<ChatSession[]>;
  updateSessionTitle(sessionId: string, title: string): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  
  // Message Management
  saveMessage(sessionId: string, message: ChatHistoryMessage): Promise<void>;
  getSessionMessages(sessionId: string): Promise<ChatHistoryMessage[]>;
  deleteMessage(sessionId: string, messageId: string): Promise<void>;
  
  // AI Response
  generateResponse(content: string, context?: ChatHistoryMessage[]): Promise<string>;
}

/**
 * Message service interface for message-specific operations
 * Uses scroll-based loading for smooth chat experience (no pagination)
 */
export interface MessageService {
  saveMessage(sessionId: string, message: ChatHistoryMessage): Promise<void>;
  getMessages(sessionId: string, limit?: number, offset?: number): Promise<ChatHistoryMessage[]>; // limit/offset kept for compatibility but not used for pagination
  updateMessage(sessionId: string, messageId: string, content: string): Promise<void>;
  deleteMessage(sessionId: string, messageId: string): Promise<void>;
  getMessageCount(sessionId: string): Promise<number>;
}

/**
 * Session service interface for session-specific operations
 */
export interface SessionService {
  createSession(userId: string, title?: string): Promise<ChatSession>;
  getSession(sessionId: string, userId: string): Promise<ChatSession | null>;
  getUserSessions(userId: string, limit?: number, offset?: number): Promise<ChatSession[]>;
  updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<void>;
  deleteSession(sessionId: string, userId: string): Promise<void>;
  generateSessionTitle(messages: ChatHistoryMessage[]): Promise<string>;
}

/**
 * AI Response service interface
 */
export interface AIResponseService {
  generateResponse(prompt: string, context?: ChatHistoryMessage[]): Promise<string>;
  validateInput(content: string): boolean;
  formatResponse(response: string): string;
}

// ============================================================================
// Error Types
// ============================================================================

export enum ChatErrorType {
  // Authentication Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // Session Errors
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_ACCESS_DENIED = 'SESSION_ACCESS_DENIED',
  INVALID_SESSION_ID = 'INVALID_SESSION_ID',
  
  // Message Errors
  MESSAGE_TOO_LONG = 'MESSAGE_TOO_LONG',
  MESSAGE_EMPTY = 'MESSAGE_EMPTY',
  MESSAGE_SAVE_FAILED = 'MESSAGE_SAVE_FAILED',
  
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  
  // Database Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  
  // AI Service Errors
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  AI_RESPONSE_FAILED = 'AI_RESPONSE_FAILED',
  
  // Validation Errors
  INVALID_INPUT = 'INVALID_INPUT',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  
  // General Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ChatError {
  type: ChatErrorType;
  message: string;
  details?: any;
  timestamp: Date;
  retryable: boolean;
}

// ============================================================================
// State Management Types
// ============================================================================

export interface ChatState {
  // Current session
  currentSessionId: string | null;
  currentSession: ChatSession | null;
  
  // Messages
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  
  // UI State
  isTyping: boolean;
  isSending: boolean;
  
  // Error State
  error: ChatError | null;
  
  // Input State
  inputValue: string;
}

export interface ChatHistoryState {
  sessions: ChatSessionSummary[];
  isLoading: boolean;
  error: ChatError | null;
  hasMore: boolean;
  currentPage: number;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseAuthReturn {
  // User state
  user: any | null;
  userId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  // Auth actions
  redirectToLogin: () => void;
  handleAuthStateChange: (callback: (user: any | null) => void) => () => void;
  
  // Error state
  authError: string | null;
  clearAuthError: () => void;
}

export interface UseChatReturn {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: ChatError | null;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  
  // Input handling
  inputValue: string;
  setInputValue: (value: string) => void;
}

export interface UseChatHistoryReturn {
  // State
  sessions: ChatSessionSummary[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: ChatError | null;
  hasMore: boolean;
  
  // Actions
  createSession: (title?: string) => Promise<string>;
  switchSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
  loadMore: () => Promise<void>;
  
  // Cache management
  addMessage: (message: Omit<ChatHistoryMessage, 'timestamp'>) => Promise<void>;
  getCachedSession: (sessionId: string) => ChatSession | null;
  syncCache: () => Promise<void>;
  
  // Metadata
  lastSyncTime: Date | null;
  currentPage: number;
  
  // Auth integration (Task 3.3)
  isAuthenticated: boolean;
  authLoading: boolean;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onRetryMessage?: (messageId: string) => void;
  isLoading?: boolean;
  isSending?: boolean;
  userId?: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface MessageBubbleProps {
  message: ChatMessage;
  onRetry?: (messageId: string) => void;
  showTimestamp?: boolean;
  showStatus?: boolean;
}

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface SidebarProps {
  sessions: ChatSessionSummary[];
  currentSessionId: string | null;
  onSessionSwitch: (sessionId: string) => void;
  onSessionDelete: (sessionId: string) => void;
  onNewSession: () => void;
  isLoading?: boolean;
}

export interface HistoryItemProps {
  session: ChatSessionSummary;
  isActive: boolean;
  onClick: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface CreateSessionResponse {
  sessionId: string;
  session: ChatSession;
}

export interface GetSessionsResponse {
  sessions: ChatSession[];
  total: number;
  hasMore: boolean;
}

export interface SendMessageResponse {
  message: ChatHistoryMessage;
  aiResponse?: ChatHistoryMessage;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface ChatConfig {
  maxMessageLength: number;
  maxSessionsPerUser: number;
  messageRetryLimit: number;
  sessionTitleMaxLength: number;
  autoSaveInterval: number;
  requestTimeout: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type MessageWithoutId = Omit<ChatMessage, 'id'>;
export type SessionWithoutMessages = Omit<ChatSession, 'messages'>;
export type CreateSessionRequest = Pick<ChatSession, 'user_id' | 'title'>;
export type UpdateSessionRequest = Partial<Pick<ChatSession, 'title'>>;

// ============================================================================
// Error Recovery Types
// ============================================================================

export interface ErrorRecoveryStrategy {
  retryMessage: (messageId: string) => Promise<void>;
  recoverSession: (sessionId: string) => Promise<void>;
  reconnect: () => Promise<void>;
  syncLocalCache: () => Promise<void>;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  maxRetryDelay: number;
}