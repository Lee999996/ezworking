// Chat Service Interface Definitions

import { 
  ChatSession, 
  ChatHistoryMessage, 
  ChatError,
  ChatConfig,
  RetryConfig 
} from './chat';

// ============================================================================
// Database Service Interfaces
// ============================================================================

/**
 * Database operations for chat sessions
 */
export interface ChatSessionRepository {
  create(userId: string, title: string): Promise<ChatSession>;
  findById(sessionId: string): Promise<ChatSession | null>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<ChatSession[]>;
  update(sessionId: string, updates: Partial<ChatSession>): Promise<void>;
  delete(sessionId: string): Promise<void>;
  exists(sessionId: string): Promise<boolean>;
  countByUserId(userId: string): Promise<number>;
}

/**
 * Database operations for chat messages
 */
export interface ChatMessageRepository {
  create(sessionId: string, message: ChatHistoryMessage): Promise<void>;
  findBySessionId(sessionId: string, limit?: number, offset?: number): Promise<ChatHistoryMessage[]>;
  update(sessionId: string, messageId: string, content: string): Promise<void>;
  delete(sessionId: string, messageId: string): Promise<void>;
  countBySessionId(sessionId: string): Promise<number>;
  deleteBySessionId(sessionId: string): Promise<void>;
}

// ============================================================================
// External Service Interfaces
// ============================================================================

/**
 * Authentication service interface
 */
export interface AuthService {
  getCurrentUser(): Promise<{ id: string; email: string } | null>;
  isAuthenticated(): boolean;
  onAuthStateChange(callback: (user: any) => void): () => void;
}

/**
 * Cache service interface for local storage and performance optimization
 */
export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

/**
 * Analytics service interface for tracking user interactions
 */
export interface AnalyticsService {
  trackSessionCreated(sessionId: string): void;
  trackMessageSent(sessionId: string, messageLength: number): void;
  trackMessageReceived(sessionId: string, responseTime: number): void;
  trackError(error: ChatError): void;
  trackSessionDeleted(sessionId: string): void;
}

// ============================================================================
// Validation Service Interfaces
// ============================================================================

/**
 * Input validation service
 */
export interface ValidationService {
  validateMessage(content: string): { isValid: boolean; error?: string };
  validateSessionTitle(title: string): { isValid: boolean; error?: string };
  validateSessionId(sessionId: string): { isValid: boolean; error?: string };
  validateUserId(userId: string): { isValid: boolean; error?: string };
}

/**
 * Content moderation service
 */
export interface ModerationService {
  moderateContent(content: string): Promise<{ allowed: boolean; reason?: string }>;
  flagInappropriateContent(content: string): Promise<void>;
}

// ============================================================================
// Notification Service Interfaces
// ============================================================================

/**
 * Notification service for user feedback
 */
export interface NotificationService {
  showSuccess(message: string): void;
  showError(message: string): void;
  showWarning(message: string): void;
  showInfo(message: string): void;
  dismiss(id?: string): void;
}

// ============================================================================
// Storage Service Interfaces
// ============================================================================

/**
 * Local storage service for offline support
 */
export interface LocalStorageService {
  saveSession(session: ChatSession): Promise<void>;
  getSession(sessionId: string): Promise<ChatSession | null>;
  savePendingMessage(sessionId: string, message: ChatHistoryMessage): Promise<void>;
  getPendingMessages(sessionId: string): Promise<ChatHistoryMessage[]>;
  clearPendingMessages(sessionId: string): Promise<void>;
  syncWithServer(): Promise<void>;
}

// ============================================================================
// Configuration Service Interfaces
// ============================================================================

/**
 * Configuration service for managing app settings
 */
export interface ConfigService {
  getChatConfig(): ChatConfig;
  getRetryConfig(): RetryConfig;
  updateConfig(updates: Partial<ChatConfig>): void;
  resetToDefaults(): void;
}

// ============================================================================
// Logging Service Interfaces
// ============================================================================

/**
 * Logging service for debugging and monitoring
 */
export interface LoggingService {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: Error, data?: any): void;
  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void;
}

// ============================================================================
// Network Service Interfaces
// ============================================================================

/**
 * Network service for handling connectivity
 */
export interface NetworkService {
  isOnline(): boolean;
  onNetworkChange(callback: (isOnline: boolean) => void): () => void;
  retryRequest<T>(request: () => Promise<T>, config?: RetryConfig): Promise<T>;
}

// ============================================================================
// File Upload Service Interfaces
// ============================================================================

/**
 * File upload service for handling attachments
 */
export interface FileUploadService {
  uploadFile(file: File, sessionId: string): Promise<{ url: string; id: string }>;
  deleteFile(fileId: string): Promise<void>;
  getFileUrl(fileId: string): Promise<string>;
  validateFile(file: File): { isValid: boolean; error?: string };
}

// ============================================================================
// Search Service Interfaces
// ============================================================================

/**
 * Search service for finding messages and sessions
 */
export interface SearchService {
  searchMessages(query: string, userId: string): Promise<ChatHistoryMessage[]>;
  searchSessions(query: string, userId: string): Promise<ChatSession[]>;
  getSearchSuggestions(query: string): Promise<string[]>;
}

// ============================================================================
// Export Service Interfaces
// ============================================================================

/**
 * Export service for data portability
 */
export interface ExportService {
  exportSession(sessionId: string, format: 'json' | 'txt' | 'pdf'): Promise<Blob>;
  exportAllSessions(userId: string, format: 'json' | 'txt' | 'pdf'): Promise<Blob>;
  importSession(data: Blob, userId: string): Promise<ChatSession>;
}

// ============================================================================
// Composite Service Interfaces
// ============================================================================

/**
 * Main service container interface
 */
export interface ChatServiceContainer {
  chatService: import('./chat').ChatService;
  messageService: import('./chat').MessageService;
  sessionService: import('./chat').SessionService;
  aiResponseService: import('./chat').AIResponseService;
  authService: AuthService;
  cacheService: CacheService;
  analyticsService: AnalyticsService;
  validationService: ValidationService;
  moderationService: ModerationService;
  notificationService: NotificationService;
  localStorageService: LocalStorageService;
  configService: ConfigService;
  loggingService: LoggingService;
  networkService: NetworkService;
  fileUploadService: FileUploadService;
  searchService: SearchService;
  exportService: ExportService;
}

// ============================================================================
// Service Factory Interfaces
// ============================================================================

/**
 * Service factory for dependency injection
 */
export interface ServiceFactory {
  createChatService(): import('./chat').ChatService;
  createMessageService(): import('./chat').MessageService;
  createSessionService(): import('./chat').SessionService;
  createAIResponseService(): import('./chat').AIResponseService;
  createServiceContainer(): ChatServiceContainer;
}