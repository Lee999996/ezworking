// Chat System Utility Types and Helper Functions

import { 
  ChatMessage, 
  ChatHistoryMessage, 
  ChatSession, 
  ChatError, 
  ChatErrorType
} from './chat';
import { 
  CHAT_CONFIG, 
  ERROR_MESSAGES, 
  REGEX_PATTERNS, 
  TYPE_GUARDS,
  MessageStatus,
  SessionStatus 
} from './chat-constants';

// ============================================================================
// Type Validation Utilities
// ============================================================================

/**
 * Validates a chat message object
 */
export function validateChatMessage(message: Partial<ChatMessage>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!message.id || typeof message.id !== 'string') {
    errors.push('Message ID is required and must be a string');
  }

  if (!message.content || typeof message.content !== 'string') {
    errors.push('Message content is required and must be a string');
  } else if (message.content.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
    errors.push(`Message content exceeds maximum length of ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} characters`);
  } else if (TYPE_GUARDS.isEmptyMessage(message.content)) {
    errors.push('Message content cannot be empty or whitespace only');
  }

  if (!message.type || !['user', 'assistant', 'component'].includes(message.type)) {
    errors.push('Message type must be one of: user, assistant, component');
  }

  if (message.timestamp && !(message.timestamp instanceof Date)) {
    errors.push('Message timestamp must be a Date object');
  }

  if (message.status && !Object.values(MessageStatus).includes(message.status as MessageStatus)) {
    errors.push('Invalid message status');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a chat session object
 */
export function validateChatSession(session: Partial<ChatSession>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!session.id || !TYPE_GUARDS.isValidSessionId(session.id)) {
    errors.push('Session ID is required and must be a valid UUID');
  }

  if (!session.user_id || !TYPE_GUARDS.isValidUserId(session.user_id)) {
    errors.push('User ID is required and must be a valid UUID');
  }

  if (!session.title || typeof session.title !== 'string') {
    errors.push('Session title is required and must be a string');
  } else if (session.title.length > CHAT_CONFIG.SESSION_TITLE_MAX_LENGTH) {
    errors.push(`Session title exceeds maximum length of ${CHAT_CONFIG.SESSION_TITLE_MAX_LENGTH} characters`);
  }

  if (session.messages && !Array.isArray(session.messages)) {
    errors.push('Session messages must be an array');
  }

  if (session.created_at && !(session.created_at instanceof Date)) {
    errors.push('Session created_at must be a Date object');
  }

  if (session.updated_at && !(session.updated_at instanceof Date)) {
    errors.push('Session updated_at must be a Date object');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a chat history message
 */
export function validateChatHistoryMessage(message: Partial<ChatHistoryMessage>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!message.role || !['user', 'ai'].includes(message.role)) {
    errors.push('Message role must be either "user" or "ai"');
  }

  if (!message.content || typeof message.content !== 'string') {
    errors.push('Message content is required and must be a string');
  } else if (message.content.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
    errors.push(`Message content exceeds maximum length of ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} characters`);
  } else if (TYPE_GUARDS.isEmptyMessage(message.content)) {
    errors.push('Message content cannot be empty or whitespace only');
  }

  if (message.timestamp && !(message.timestamp instanceof Date)) {
    errors.push('Message timestamp must be a Date object');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// Type Conversion Utilities
// ============================================================================

/**
 * Converts a ChatMessage to ChatHistoryMessage format
 */
export function chatMessageToHistoryMessage(message: ChatMessage): ChatHistoryMessage {
  return {
    role: message.type === 'user' ? 'user' : 'ai',
    content: message.content,
    timestamp: message.timestamp
  };
}

/**
 * Converts a ChatHistoryMessage to ChatMessage format
 */
export function historyMessageToChatMessage(
  message: ChatHistoryMessage, 
  id?: string,
  userId?: string
): ChatMessage {
  return {
    id: id || generateMessageId(),
    type: message.role === 'user' ? 'user' : 'assistant',
    content: message.content,
    timestamp: message.timestamp,
    userId,
    status: 'sent'
  };
}

/**
 * Converts database row to ChatSession
 */
export function dbRowToChatSession(row: any): ChatSession {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    messages: row.messages || [],
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at)
  };
}

/**
 * Converts database row to ChatHistoryMessage
 */
export function dbRowToChatHistoryMessage(row: any): ChatHistoryMessage {
  return {
    role: row.role,
    content: row.content,
    timestamp: new Date(row.timestamp)
  };
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Creates a standardized ChatError object
 */
export function createChatError(
  type: ChatErrorType,
  message?: string,
  details?: any,
  retryable: boolean = true
): ChatError {
  return {
    type,
    message: message || ERROR_MESSAGES[type] || ERROR_MESSAGES.UNKNOWN_ERROR,
    details,
    timestamp: new Date(),
    retryable
  };
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: ChatError): boolean {
  const nonRetryableErrors = [
    ChatErrorType.UNAUTHORIZED,
    ChatErrorType.FORBIDDEN,
    ChatErrorType.SESSION_ACCESS_DENIED,
    ChatErrorType.INVALID_SESSION_ID,
    ChatErrorType.MESSAGE_TOO_LONG,
    ChatErrorType.MESSAGE_EMPTY,
    ChatErrorType.INVALID_INPUT,
    ChatErrorType.VALIDATION_FAILED
  ];

  return error.retryable && !nonRetryableErrors.includes(error.type);
}

/**
 * Gets user-friendly error message
 */
export function getErrorMessage(error: ChatError | Error | string): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
}

// ============================================================================
// ID Generation Utilities
// ============================================================================

/**
 * Generates a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates a unique session ID (UUID v4)
 */
export function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================================================
// Content Processing Utilities
// ============================================================================

/**
 * Sanitizes message content
 */
export function sanitizeMessageContent(content: string): string {
  return content
    .trim()
    .replace(REGEX_PATTERNS.HTML_TAGS, '') // Remove HTML tags
    .substring(0, CHAT_CONFIG.MAX_MESSAGE_LENGTH); // Truncate if too long
}

/**
 * Generates session title from messages
 */
export function generateSessionTitle(messages: ChatHistoryMessage[]): string {
  if (messages.length === 0) {
    return '新对话';
  }

  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) {
    return '新对话';
  }

  // Take first 30 characters of the first user message
  const title = firstUserMessage.content.substring(0, 30);
  return title.length < firstUserMessage.content.length ? `${title}...` : title;
}

/**
 * Formats timestamp for display
 */
export function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return timestamp.toLocaleDateString('zh-CN');
  }
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Sorts sessions by updated_at in descending order
 */
export function sortSessionsByDate(sessions: ChatSession[]): ChatSession[] {
  return [...sessions].sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());
}

/**
 * Sorts messages by timestamp in ascending order
 */
export function sortMessagesByTime(messages: ChatHistoryMessage[]): ChatHistoryMessage[] {
  return [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * Groups messages by date
 */
export function groupMessagesByDate(messages: ChatHistoryMessage[]): Record<string, ChatHistoryMessage[]> {
  return messages.reduce((groups, message) => {
    const date = message.timestamp.toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatHistoryMessage[]>);
}

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================================================
// Local Storage Utilities
// ============================================================================

/**
 * Safely gets item from localStorage
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Failed to get item from localStorage: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Safely sets item in localStorage
 */
export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to set item in localStorage: ${key}`, error);
  }
}

/**
 * Safely removes item from localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove item from localStorage: ${key}`, error);
  }
}