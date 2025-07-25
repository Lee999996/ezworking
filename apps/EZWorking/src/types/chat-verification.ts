// Type verification script - ensures all types work correctly together

import {
  ChatMessage,
  ChatHistoryMessage,
  ChatSession,
  ChatError,
  ChatErrorType,
  ChatService,
  MessageService,
  SessionService,
  AIResponseService
} from './chat';

import {
  MessageStatus,
  SessionStatus,
  CHAT_CONFIG,
  ERROR_MESSAGES
} from './chat-constants';

import {
  validateChatMessage,
  validateChatSession,
  chatMessageToHistoryMessage,
  historyMessageToChatMessage,
  createChatError,
  generateMessageId,
  generateSessionId
} from './chat-utils';

// Verify type definitions work correctly
function verifyTypes() {
  // Test ChatMessage
  const message: ChatMessage = {
    id: generateMessageId(),
    type: 'user',
    content: 'Hello world',
    timestamp: new Date(),
    userId: 'user-123',
    status: 'sent'
  };

  // Test ChatHistoryMessage
  const historyMessage: ChatHistoryMessage = {
    role: 'user',
    content: 'Test message',
    timestamp: new Date()
  };

  // Test ChatSession
  const session: ChatSession = {
    id: generateSessionId(),
    user_id: 'user-456',
    title: 'Test Session',
    messages: [historyMessage],
    created_at: new Date(),
    updated_at: new Date(),
    status: 'active'
  };

  // Test ChatError
  const error: ChatError = createChatError(
    ChatErrorType.NETWORK_ERROR,
    'Test error message'
  );

  // Test validation functions
  const messageValidation = validateChatMessage(message);
  const sessionValidation = validateChatSession(session);

  // Test type conversions
  const convertedHistory = chatMessageToHistoryMessage(message);
  const convertedMessage = historyMessageToChatMessage(historyMessage);

  // Test constants
  const maxLength = CHAT_CONFIG.MAX_MESSAGE_LENGTH;
  const errorMsg = ERROR_MESSAGES.NETWORK_ERROR;
  const sendingStatus = MessageStatus.SENDING;
  const activeStatus = SessionStatus.ACTIVE;

  // Test service interfaces (mock implementations)
  const mockChatService: ChatService = {
    createSession: async (userId: string, title?: string) => 'session-id',
    getSession: async (sessionId: string) => session,
    getUserSessions: async (userId: string) => [session],
    updateSessionTitle: async (sessionId: string, title: string) => {},
    deleteSession: async (sessionId: string) => {},
    saveMessage: async (sessionId: string, message: ChatHistoryMessage) => {},
    getSessionMessages: async (sessionId: string) => [historyMessage],
    deleteMessage: async (sessionId: string, messageId: string) => {},
    generateResponse: async (content: string, context?: ChatHistoryMessage[]) => 'AI response'
  };

  const mockMessageService: MessageService = {
    saveMessage: async (sessionId: string, message: ChatHistoryMessage) => {},
    getMessages: async (sessionId: string, limit?: number, offset?: number) => [historyMessage],
    updateMessage: async (sessionId: string, messageId: string, content: string) => {},
    deleteMessage: async (sessionId: string, messageId: string) => {},
    getMessageCount: async (sessionId: string) => 1
  };

  const mockSessionService: SessionService = {
    createSession: async (userId: string, title?: string) => session,
    getSession: async (sessionId: string, userId: string) => session,
    getUserSessions: async (userId: string, limit?: number, offset?: number) => [session],
    updateSession: async (sessionId: string, updates: Partial<ChatSession>) => {},
    deleteSession: async (sessionId: string, userId: string) => {},
    generateSessionTitle: async (messages: ChatHistoryMessage[]) => 'Generated Title'
  };

  const mockAIService: AIResponseService = {
    generateResponse: async (prompt: string, context?: ChatHistoryMessage[]) => 'AI response',
    validateInput: (content: string) => content.length > 0,
    formatResponse: (response: string) => response.trim()
  };

  console.log('✅ All type definitions are working correctly!');
  console.log('✅ Message validation:', messageValidation.isValid);
  console.log('✅ Session validation:', sessionValidation.isValid);
  console.log('✅ Type conversions working');
  console.log('✅ Constants accessible');
  console.log('✅ Service interfaces implementable');
  
  return {
    message,
    historyMessage,
    session,
    error,
    messageValidation,
    sessionValidation,
    convertedHistory,
    convertedMessage,
    maxLength,
    errorMsg,
    sendingStatus,
    activeStatus,
    mockChatService,
    mockMessageService,
    mockSessionService,
    mockAIService
  };
}

// Export for potential use
export { verifyTypes };

// Run verification if this file is executed directly
if (require.main === module) {
  verifyTypes();
}