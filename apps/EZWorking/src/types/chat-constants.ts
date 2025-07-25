// Chat System Constants and Enums

// ============================================================================
// Status Enums
// ============================================================================

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered',
  READ = 'read'
}

export enum SessionStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  SUSPENDED = 'suspended'
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  // Authentication Errors
  UNAUTHORIZED: '请先登录后再使用聊天功能',
  FORBIDDEN: '您没有权限访问此对话',
  SESSION_EXPIRED: '登录已过期，请重新登录',
  
  // Session Errors
  SESSION_NOT_FOUND: '对话不存在或已被删除',
  SESSION_ACCESS_DENIED: '您没有权限访问此对话',
  INVALID_SESSION_ID: '无效的对话ID',
  SESSION_CREATION_FAILED: '创建对话失败，请重试',
  SESSION_DELETE_FAILED: '删除对话失败，请重试',
  
  // Message Errors
  MESSAGE_TOO_LONG: '消息内容过长，请缩短后重试',
  MESSAGE_EMPTY: '消息内容不能为空',
  MESSAGE_SAVE_FAILED: '消息保存失败，请重试',
  MESSAGE_SEND_FAILED: '消息发送失败，请检查网络连接',
  
  // Network Errors
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  REQUEST_TIMEOUT: '请求超时，请重试',
  SERVER_ERROR: '服务器错误，请稍后重试',
  CONNECTION_LOST: '网络连接中断，正在尝试重连...',
  
  // Database Errors
  DATABASE_ERROR: '数据库操作失败，请重试',
  CONNECTION_FAILED: '数据库连接失败',
  DATA_CORRUPTION: '数据损坏，请联系技术支持',
  
  // AI Service Errors
  AI_SERVICE_UNAVAILABLE: 'AI服务暂时不可用，请稍后重试',
  AI_RESPONSE_FAILED: 'AI回复生成失败，请重试',
  AI_SERVICE_TIMEOUT: 'AI服务响应超时',
  
  // Validation Errors
  INVALID_INPUT: '输入内容格式不正确',
  VALIDATION_FAILED: '数据验证失败',
  CONTENT_MODERATION_FAILED: '内容审核未通过',
  
  // File Upload Errors
  FILE_TOO_LARGE: '文件大小超出限制',
  FILE_TYPE_NOT_SUPPORTED: '不支持的文件类型',
  UPLOAD_FAILED: '文件上传失败',
  
  // General Errors
  UNKNOWN_ERROR: '发生未知错误，请重试',
  OPERATION_CANCELLED: '操作已取消',
  PERMISSION_DENIED: '权限不足'
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  SESSION_CREATED: '新对话已创建',
  SESSION_DELETED: '对话已删除',
  MESSAGE_SENT: '消息已发送',
  SESSION_SWITCHED: '已切换到新对话',
  DATA_SYNCED: '数据同步完成',
  SETTINGS_SAVED: '设置已保存'
} as const;

// ============================================================================
// Configuration Constants
// ============================================================================

export const CHAT_CONFIG = {
  // Message Limits
  MAX_MESSAGE_LENGTH: 10000,
  MIN_MESSAGE_LENGTH: 1,
  MAX_MESSAGES_PER_SESSION: 1000,
  
  // Session Limits
  MAX_SESSIONS_PER_USER: 100,
  SESSION_TITLE_MAX_LENGTH: 100,
  SESSION_TITLE_MIN_LENGTH: 1,
  
  // Retry Configuration
  MESSAGE_RETRY_LIMIT: 3,
  REQUEST_RETRY_LIMIT: 3,
  RETRY_DELAY: 1000, // milliseconds
  MAX_RETRY_DELAY: 10000, // milliseconds
  BACKOFF_MULTIPLIER: 2,
  
  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  AI_RESPONSE_TIMEOUT: 60000, // 60 seconds
  CONNECTION_TIMEOUT: 10000, // 10 seconds
  
  // Auto-save
  AUTO_SAVE_INTERVAL: 5000, // 5 seconds
  DEBOUNCE_DELAY: 300, // milliseconds
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Cache
  CACHE_TTL: 300000, // 5 minutes
  MAX_CACHE_SIZE: 50, // number of sessions
  
  // UI
  TYPING_INDICATOR_DELAY: 1000,
  MESSAGE_ANIMATION_DURATION: 200,
  SCROLL_BEHAVIOR: 'smooth' as ScrollBehavior,
  
  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/pdf',
    'application/json'
  ],
  
  // Search
  SEARCH_DEBOUNCE_DELAY: 500,
  MIN_SEARCH_QUERY_LENGTH: 2,
  MAX_SEARCH_RESULTS: 50
} as const;

// ============================================================================
// UI Constants
// ============================================================================

export const UI_CONSTANTS = {
  // Component IDs
  CHAT_CONTAINER_ID: 'chat-container',
  MESSAGE_LIST_ID: 'message-list',
  CHAT_INPUT_ID: 'chat-input',
  SIDEBAR_ID: 'chat-sidebar',
  
  // CSS Classes
  MESSAGE_USER_CLASS: 'message-user',
  MESSAGE_AI_CLASS: 'message-ai',
  MESSAGE_SENDING_CLASS: 'message-sending',
  MESSAGE_FAILED_CLASS: 'message-failed',
  SESSION_ACTIVE_CLASS: 'session-active',
  
  // Keyboard Shortcuts
  SEND_MESSAGE_KEY: 'Enter',
  NEW_LINE_KEY: 'Shift+Enter',
  NEW_SESSION_KEY: 'Ctrl+N',
  SEARCH_KEY: 'Ctrl+F',
  
  // Placeholders
  MESSAGE_PLACEHOLDER: '输入您的消息...',
  SEARCH_PLACEHOLDER: '搜索对话...',
  SESSION_TITLE_PLACEHOLDER: '新对话',
  
  // Loading Messages
  LOADING_SESSIONS: '加载对话列表...',
  LOADING_MESSAGES: '加载消息...',
  SENDING_MESSAGE: '发送中...',
  GENERATING_RESPONSE: 'AI正在思考...',
  
  // Empty States
  NO_SESSIONS: '暂无对话记录',
  NO_MESSAGES: '开始新的对话吧！',
  NO_SEARCH_RESULTS: '未找到相关内容'
} as const;

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  // Session endpoints
  SESSIONS: '/api/chat/sessions',
  SESSION_BY_ID: (id: string) => `/api/chat/sessions/${id}`,
  USER_SESSIONS: (userId: string) => `/api/chat/sessions/user/${userId}`,
  
  // Message endpoints
  MESSAGES: '/api/chat/messages',
  SESSION_MESSAGES: (sessionId: string) => `/api/chat/sessions/${sessionId}/messages`,
  MESSAGE_BY_ID: (sessionId: string, messageId: string) => 
    `/api/chat/sessions/${sessionId}/messages/${messageId}`,
  
  // AI endpoints
  AI_RESPONSE: '/api/chat/ai/response',
  AI_HEALTH: '/api/chat/ai/health',
  
  // File upload endpoints
  UPLOAD_FILE: '/api/chat/upload',
  FILE_BY_ID: (fileId: string) => `/api/chat/files/${fileId}`,
  
  // Search endpoints
  SEARCH_MESSAGES: '/api/chat/search/messages',
  SEARCH_SESSIONS: '/api/chat/search/sessions',
  
  // Export endpoints
  EXPORT_SESSION: (sessionId: string) => `/api/chat/export/session/${sessionId}`,
  EXPORT_ALL: '/api/chat/export/all'
} as const;

// ============================================================================
// Event Names
// ============================================================================

export const EVENTS = {
  // Session events
  SESSION_CREATED: 'session:created',
  SESSION_UPDATED: 'session:updated',
  SESSION_DELETED: 'session:deleted',
  SESSION_SWITCHED: 'session:switched',
  
  // Message events
  MESSAGE_SENT: 'message:sent',
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_FAILED: 'message:failed',
  MESSAGE_RETRY: 'message:retry',
  
  // Connection events
  CONNECTION_ESTABLISHED: 'connection:established',
  CONNECTION_LOST: 'connection:lost',
  CONNECTION_RESTORED: 'connection:restored',
  
  // Error events
  ERROR_OCCURRED: 'error:occurred',
  ERROR_RESOLVED: 'error:resolved',
  
  // UI events
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  SCROLL_TO_BOTTOM: 'scroll:bottom'
} as const;

// ============================================================================
// Local Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  // Session storage
  CURRENT_SESSION_ID: 'chat:currentSessionId',
  SESSION_CACHE: 'chat:sessionCache',
  PENDING_MESSAGES: 'chat:pendingMessages',
  
  // User preferences
  USER_PREFERENCES: 'chat:userPreferences',
  THEME_PREFERENCE: 'chat:theme',
  NOTIFICATION_SETTINGS: 'chat:notifications',
  
  // Cache keys
  MESSAGES_CACHE: 'chat:messagesCache',
  SESSIONS_CACHE: 'chat:sessionsCache',
  USER_CACHE: 'chat:userCache',
  
  // Temporary data
  DRAFT_MESSAGE: 'chat:draftMessage',
  SCROLL_POSITION: 'chat:scrollPosition',
  SIDEBAR_STATE: 'chat:sidebarState'
} as const;

// ============================================================================
// Regular Expressions
// ============================================================================

export const REGEX_PATTERNS = {
  // Validation patterns
  SESSION_ID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  USER_ID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Content patterns
  WHITESPACE_ONLY: /^\s*$/,
  HTML_TAGS: /<[^>]*>/g,
  URLS: /https?:\/\/[^\s]+/g,
  
  // File patterns
  IMAGE_EXTENSIONS: /\.(jpg|jpeg|png|gif|webp)$/i,
  DOCUMENT_EXTENSIONS: /\.(pdf|doc|docx|txt)$/i
} as const;

// ============================================================================
// Type Guards
// ============================================================================

export const TYPE_GUARDS = {
  isValidSessionId: (id: string): boolean => REGEX_PATTERNS.SESSION_ID.test(id),
  isValidUserId: (id: string): boolean => REGEX_PATTERNS.USER_ID.test(id),
  isValidEmail: (email: string): boolean => REGEX_PATTERNS.EMAIL.test(email),
  isEmptyMessage: (content: string): boolean => REGEX_PATTERNS.WHITESPACE_ONLY.test(content),
  isImageFile: (filename: string): boolean => REGEX_PATTERNS.IMAGE_EXTENSIONS.test(filename),
  isDocumentFile: (filename: string): boolean => REGEX_PATTERNS.DOCUMENT_EXTENSIONS.test(filename)
} as const;