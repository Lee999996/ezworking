import type { ChatService, ChatSession, ChatHistoryMessage } from '../../types/chat';
import { sessionService } from './session';
import { messageService } from './message';
import { aiResponseService } from './ai-response';
import { createChatError, createErrorContext, logError } from '../../utils/error-handling';
import { ChatErrorType } from '../../types/chat';

/**
 * Main chat service that combines all chat-related functionality
 * This service provides a unified interface for managing conversations
 */
export class MainChatService implements ChatService {

  // Session Management
  
  /**
   * Create a new chat session
   * @param userId - The user ID
   * @param title - Optional session title
   * @returns Promise<string> - The created session ID
   */
  async createSession(userId: string, title?: string): Promise<string> {
    const context = createErrorContext('createSession', { userId, title });
    
    try {
      const session = await sessionService.createSession(userId, title);
      return session.id;
    } catch (error) {
      const chatError = createChatError(error, '创建会话失败', ChatErrorType.DATABASE_ERROR);
      logError(chatError, context);
      throw chatError;
    }
  }

  /**
   * Get a specific session by ID
   * @param sessionId - The session ID
   * @returns Promise<ChatSession | null> - The session or null if not found
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    const context = createErrorContext('getSession', { sessionId });
    
    try {
      // Note: This method needs user ID for permission check
      // In a real implementation, you'd get the current user from auth context
      // For now, we'll need to modify this to accept userId parameter
      throw new Error('getSession requires user authentication context');
    } catch (error) {
      const chatError = createChatError(error, '获取会话失败', ChatErrorType.SESSION_NOT_FOUND);
      logError(chatError, context);
      throw chatError;
    }
  }

  /**
   * Get all sessions for a user
   * @param userId - The user ID
   * @returns Promise<ChatSession[]> - Array of user sessions
   */
  async getUserSessions(userId: string): Promise<ChatSession[]> {
    const context = createErrorContext('getUserSessions', { userId });
    
    try {
      return await sessionService.getUserSessions(userId);
    } catch (error) {
      const chatError = createChatError(error, '获取会话列表失败', ChatErrorType.DATABASE_ERROR);
      logError(chatError, context);
      throw chatError;
    }
  }

  /**
   * Update session title
   * @param sessionId - The session ID
   * @param title - New session title
   */
  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    const context = createErrorContext('updateSessionTitle', { sessionId, title });
    
    try {
      await sessionService.updateSession(sessionId, { title });
    } catch (error) {
      const chatError = createChatError(error, '更新会话标题失败', ChatErrorType.DATABASE_ERROR);
      logError(chatError, context);
      throw chatError;
    }
  }

  /**
   * Delete a session and all its messages
   * @param sessionId - The session ID
   */
  async deleteSession(sessionId: string): Promise<void> {
    const context = createErrorContext('deleteSession', { sessionId });
    
    try {
      // Note: This method needs user ID for permission check
      // In a real implementation, you'd get the current user from auth context
      throw new Error('deleteSession requires user authentication context');
    } catch (error) {
      const chatError = createChatError(error, '删除会话失败', ChatErrorType.DATABASE_ERROR);
      logError(chatError, context);
      throw chatError;
    }
  }

  // Message Management

  /**
   * Save a message to a session
   * @param sessionId - The session ID
   * @param message - The message to save
   */
  async saveMessage(sessionId: string, message: ChatHistoryMessage): Promise<void> {
    const context = createErrorContext('saveMessage', { sessionId, messageRole: message.role });
    
    try {
      await messageService.saveMessage(sessionId, message);
    } catch (error) {
      const chatError = createChatError(error, '保存消息失败', ChatErrorType.MESSAGE_SAVE_FAILED);
      logError(chatError, context);
      throw chatError;
    }
  }

  /**
   * Get messages for a session
   * @param sessionId - The session ID
   * @returns Promise<ChatHistoryMessage[]> - Array of messages
   */
  async getSessionMessages(sessionId: string): Promise<ChatHistoryMessage[]> {
    const context = createErrorContext('getSessionMessages', { sessionId });
    
    try {
      return await messageService.getMessages(sessionId);
    } catch (error) {
      const chatError = createChatError(error, '获取会话消息失败', ChatErrorType.DATABASE_ERROR);
      logError(chatError, context);
      throw chatError;
    }
  }

  /**
   * Delete a specific message
   * @param sessionId - The session ID
   * @param messageId - The message ID
   */
  async deleteMessage(sessionId: string, messageId: string): Promise<void> {
    const context = createErrorContext('deleteMessage', { sessionId, messageId });
    
    try {
      await messageService.deleteMessage(sessionId, messageId);
    } catch (error) {
      const chatError = createChatError(error, '删除消息失败', ChatErrorType.DATABASE_ERROR);
      logError(chatError, context);
      throw chatError;
    }
  }

  // AI Response Generation

  /**
   * Generate AI response for user input
   * @param content - User input content
   * @param context - Optional conversation context
   * @returns Promise<string> - AI response
   */
  async generateResponse(content: string, context?: ChatHistoryMessage[]): Promise<string> {
    const contextInfo = createErrorContext('generateResponse', { 
      contentLength: content.length, 
      contextLength: context?.length || 0 
    });
    
    try {
      return await aiResponseService.generateResponse(content, context);
    } catch (error) {
      const chatError = createChatError(error, 'AI回复生成失败', ChatErrorType.AI_RESPONSE_FAILED);
      logError(chatError, contextInfo);
      throw chatError;
    }
  }

  // Combined Operations

  /**
   * Send a message and get AI response
   * This is a convenience method that combines saving user message and generating AI response
   * @param sessionId - The session ID
   * @param userMessage - User message content
   * @param userId - User ID for message attribution
   * @returns Promise with user message and AI response
   */
  async sendMessageAndGetResponse(
    sessionId: string, 
    userMessage: string, 
    userId: string
  ): Promise<{
    userMessage: ChatHistoryMessage;
    aiResponse: ChatHistoryMessage;
  }> {
    try {
      // Create user message
      const userMsg: ChatHistoryMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      };

      // Save user message
      await this.saveMessage(sessionId, userMsg);

      // Get conversation context for AI
      const context = await this.getSessionMessages(sessionId);

      // Generate AI response
      const aiResponseContent = await this.generateResponse(userMessage, context);

      // Create AI message
      const aiMsg: ChatHistoryMessage = {
        role: 'ai',
        content: aiResponseContent,
        timestamp: new Date()
      };

      // Save AI response
      await this.saveMessage(sessionId, aiMsg);

      return {
        userMessage: userMsg,
        aiResponse: aiMsg
      };
    } catch (error) {
      throw new Error(`Failed to send message and get response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new session with an initial message
   * @param userId - The user ID
   * @param initialMessage - The first message content
   * @param title - Optional session title
   * @returns Promise with session ID and initial conversation
   */
  async createSessionWithMessage(
    userId: string, 
    initialMessage: string, 
    title?: string
  ): Promise<{
    sessionId: string;
    userMessage: ChatHistoryMessage;
    aiResponse: ChatHistoryMessage;
  }> {
    try {
      // Create session
      const sessionId = await this.createSession(userId, title);

      // Send initial message and get response
      const { userMessage, aiResponse } = await this.sendMessageAndGetResponse(
        sessionId, 
        initialMessage, 
        userId
      );

      // Generate title from first message if not provided
      if (!title) {
        const generatedTitle = await sessionService.generateSessionTitle([userMessage]);
        await this.updateSessionTitle(sessionId, generatedTitle);
      }

      return {
        sessionId,
        userMessage,
        aiResponse
      };
    } catch (error) {
      throw new Error(`Failed to create session with message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get session summary for display in sidebar
   * @param sessionId - The session ID
   * @param userId - The user ID
   * @returns Promise with session summary
   */
  async getSessionSummary(sessionId: string, userId: string): Promise<{
    id: string;
    title: string;
    lastMessage: string;
    messageCount: number;
    updatedAt: Date;
  } | null> {
    try {
      const session = await sessionService.getSession(sessionId, userId);
      if (!session) {
        return null;
      }

      const messageCount = await messageService.getMessageCount(sessionId);
      const latestMessages = await messageService.getLatestMessages(sessionId, 1);
      const lastMessage = latestMessages.length > 0 ? latestMessages[0].content : '';

      return {
        id: session.id,
        title: session.title,
        lastMessage: lastMessage.length > 50 ? lastMessage.substring(0, 47) + '...' : lastMessage,
        messageCount,
        updatedAt: session.updated_at
      };
    } catch (error) {
      throw new Error(`Failed to get session summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate service health
   * @returns Promise with health check results
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      session: boolean;
      message: boolean;
      aiResponse: boolean;
    };
    timestamp: Date;
  }> {
    try {
      const results = {
        session: true, // sessionService doesn't have health check, assume healthy
        message: true, // messageService doesn't have health check, assume healthy
        aiResponse: await aiResponseService.isServiceReady()
      };

      const allHealthy = Object.values(results).every(status => status);
      const anyHealthy = Object.values(results).some(status => status);

      return {
        status: allHealthy ? 'healthy' : anyHealthy ? 'degraded' : 'unhealthy',
        services: results,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        services: {
          session: false,
          message: false,
          aiResponse: false
        },
        timestamp: new Date()
      };
    }
  }
}

// Export singleton instance
export const chatService = new MainChatService();