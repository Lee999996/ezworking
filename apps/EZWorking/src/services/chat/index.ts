/**
 * Chat Services Export Module
 * 
 * This module exports all chat-related services for the AI chat system.
 * It provides a centralized access point for all database and AI services.
 */

// Service implementations
export { ChatSessionService, sessionService } from './session';
export { ChatMessageService, messageService } from './message';
export { ChatAIResponseService, aiResponseService } from './ai-response';
export { MainChatService, chatService } from './chat';

// Combined service interface for dependency injection
import { sessionService } from './session';
import { messageService } from './message';
import { aiResponseService } from './ai-response';
import { chatService } from './chat';

/**
 * Combined chat service container
 * Provides access to all chat services through a single interface
 */
export const chatServices = {
  main: chatService,
  session: sessionService,
  message: messageService,
  aiResponse: aiResponseService
} as const;

/**
 * Service factory for creating new service instances
 * Useful for testing or when you need fresh instances
 */
export const createChatServices = () => ({
  main: chatService,
  session: sessionService,
  message: messageService,
  aiResponse: aiResponseService
});

// Type exports for service interfaces
export type {
  SessionService,
  MessageService,
  AIResponseService,
  ChatService
} from '../../types/chat';