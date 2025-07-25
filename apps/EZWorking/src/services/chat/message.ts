import { supabase } from '../../lib/db/supabase';
import type { MessageService, ChatHistoryMessage } from '../../types/chat';

/**
 * Message management service for chat functionality
 * Handles saving, retrieving, updating and deleting chat messages
 */
export class ChatMessageService implements MessageService {

  /**
   * Save a message to the database
   * @param sessionId - The session ID
   * @param message - The message to save
   */
  async saveMessage(sessionId: string, message: ChatHistoryMessage): Promise<void> {
    try {
      // Validate input
      if (!sessionId || !message.content.trim()) {
        throw new Error('Invalid session ID or empty message content');
      }

      // Validate role
      if (!['user', 'ai'].includes(message.role)) {
        throw new Error('Invalid message role. Must be "user" or "ai"');
      }

      // Validate message length (max 10000 characters as per design)
      if (message.content.length > 10000) {
        throw new Error('Message content exceeds maximum length of 10000 characters');
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role: message.role,
          content: message.content.trim(),
          timestamp: message.timestamp.toISOString()
        });

      if (error) {
        throw new Error(`Failed to save message: ${error.message}`);
      }

      // Update session's updated_at timestamp
      await this.updateSessionTimestamp(sessionId);
    } catch (error) {
      throw new Error(`Message save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all messages for a session (scroll-based loading, no pagination)
   * @param sessionId - The session ID
   * @param limit - Optional limit for very large conversations (default: no limit)
   * @param offset - Deprecated parameter, kept for interface compatibility
   * @returns Promise<ChatHistoryMessage[]> - Array of all messages in chronological order
   */
  async getMessages(sessionId: string, limit?: number, offset?: number): Promise<ChatHistoryMessage[]> {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      // For chat applications, we load all messages at once for smooth scrolling
      // Only apply limit if explicitly provided (for very large conversations)
      let query = supabase
        .from('chat_messages')
        .select('role, content, timestamp')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      // Apply limit only if provided and reasonable (to prevent memory issues)
      if (limit && limit > 0 && limit <= 10000) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get messages: ${error.message}`);
      }

      return data.map(msg => ({
        role: msg.role as 'user' | 'ai',
        content: msg.content,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      throw new Error(`Failed to retrieve messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a message content (not typically used in chat, but available for corrections)
   * @param sessionId - The session ID
   * @param messageId - The message ID (timestamp-based identifier)
   * @param content - New message content
   */
  async updateMessage(sessionId: string, messageId: string, content: string): Promise<void> {
    try {
      if (!sessionId || !messageId || !content.trim()) {
        throw new Error('Invalid parameters for message update');
      }

      // Validate message length
      if (content.length > 10000) {
        throw new Error('Message content exceeds maximum length of 10000 characters');
      }

      // For this implementation, we'll use timestamp as messageId
      // In a more complex system, you might want actual message IDs
      const { error } = await supabase
        .from('chat_messages')
        .update({ content: content.trim() })
        .eq('session_id', sessionId)
        .eq('timestamp', messageId);

      if (error) {
        throw new Error(`Failed to update message: ${error.message}`);
      }

      // Update session's updated_at timestamp
      await this.updateSessionTimestamp(sessionId);
    } catch (error) {
      throw new Error(`Message update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a specific message
   * @param sessionId - The session ID
   * @param messageId - The message ID (timestamp-based identifier)
   */
  async deleteMessage(sessionId: string, messageId: string): Promise<void> {
    try {
      if (!sessionId || !messageId) {
        throw new Error('Invalid parameters for message deletion');
      }

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId)
        .eq('timestamp', messageId);

      if (error) {
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      // Update session's updated_at timestamp
      await this.updateSessionTimestamp(sessionId);
    } catch (error) {
      throw new Error(`Message deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the total count of messages in a session
   * @param sessionId - The session ID
   * @returns Promise<number> - Number of messages
   */
  async getMessageCount(sessionId: string): Promise<number> {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      if (error) {
        throw new Error(`Failed to get message count: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      throw new Error(`Failed to retrieve message count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete all messages for a session (used when deleting a session)
   * @param sessionId - The session ID
   */
  async deleteAllMessages(sessionId: string): Promise<void> {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId);

      if (error) {
        throw new Error(`Failed to delete all messages: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to delete all messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the latest messages from a session (useful for generating titles)
   * @param sessionId - The session ID
   * @param limit - Number of recent messages to get
   * @returns Promise<ChatHistoryMessage[]> - Array of recent messages
   */
  async getLatestMessages(sessionId: string, limit: number = 5): Promise<ChatHistoryMessage[]> {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('role, content, timestamp')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get latest messages: ${error.message}`);
      }

      // Return in chronological order (oldest first)
      return data.reverse().map(msg => ({
        role: msg.role as 'user' | 'ai',
        content: msg.content,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      throw new Error(`Failed to retrieve latest messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert messages to the specified storage format
   * This method ensures messages are stored in the format: 
   * messages=[{'role': 'user', 'content': content}, {'role': 'ai', 'content': content1}, ...]
   * @param messages - Array of ChatHistoryMessage
   * @returns Object in the specified format
   */
  formatMessagesForStorage(messages: ChatHistoryMessage[]): { messages: Array<{ role: string; content: string }> } {
    return {
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    };
  }

  /**
   * Parse messages from storage format back to ChatHistoryMessage array
   * @param storageData - Data in storage format
   * @returns Array of ChatHistoryMessage
   */
  parseMessagesFromStorage(storageData: { messages: Array<{ role: string; content: string }> }): ChatHistoryMessage[] {
    if (!storageData.messages || !Array.isArray(storageData.messages)) {
      return [];
    }

    return storageData.messages.map((msg, index) => ({
      role: msg.role as 'user' | 'ai',
      content: msg.content,
      timestamp: new Date() // In real implementation, you'd want to preserve actual timestamps
    }));
  }

  /**
   * Validate message content
   * @param content - Message content to validate
   * @returns Object with validation result
   */
  validateMessageContent(content: string): { isValid: boolean; error?: string } {
    if (!content || typeof content !== 'string') {
      return { isValid: false, error: 'Message content is required' };
    }

    const trimmedContent = content.trim();
    
    if (trimmedContent.length === 0) {
      return { isValid: false, error: 'Message content cannot be empty' };
    }

    if (trimmedContent.length > 10000) {
      return { isValid: false, error: 'Message content exceeds maximum length of 10000 characters' };
    }

    return { isValid: true };
  }

  /**
   * Update session timestamp when messages are modified
   * @param sessionId - The session ID
   */
  private async updateSessionTimestamp(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) {
        // Log error but don't throw - this is not critical
        console.warn(`Failed to update session timestamp: ${error.message}`);
      }
    } catch (error) {
      // Log error but don't throw - this is not critical
      console.warn(`Failed to update session timestamp: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get message statistics for a session
   * @param sessionId - The session ID
   * @returns Promise with message statistics
   */
  async getMessageStats(sessionId: string): Promise<{
    totalMessages: number;
    userMessages: number;
    aiMessages: number;
    averageMessageLength: number;
  }> {
    try {
      const messages = await this.getMessages(sessionId);
      
      const userMessages = messages.filter(msg => msg.role === 'user').length;
      const aiMessages = messages.filter(msg => msg.role === 'ai').length;
      const totalLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
      const averageMessageLength = messages.length > 0 ? Math.round(totalLength / messages.length) : 0;

      return {
        totalMessages: messages.length,
        userMessages,
        aiMessages,
        averageMessageLength
      };
    } catch (error) {
      throw new Error(`Failed to get message statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const messageService = new ChatMessageService();