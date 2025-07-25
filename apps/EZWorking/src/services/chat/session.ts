import { supabase } from '../../lib/db/supabase';
import type { ChatSession, SessionService, ChatHistoryMessage } from '../../types/chat';
import { ChatErrorType } from '../../types/chat';

/**
 * Session management service for chat functionality
 * Handles creating, retrieving, updating and deleting chat sessions
 */
export class ChatSessionService implements SessionService {
  
  /**
   * Create a new chat session for a user
   * @param userId - The user ID
   * @param title - Optional session title, will be auto-generated if not provided
   * @returns Promise<ChatSession> - The created session
   */
  async createSession(userId: string, title?: string): Promise<ChatSession> {
    try {
      // Generate title if not provided
      const sessionTitle = title || this.generateDefaultTitle();
      
      console.log('Creating session with:', { userId, sessionTitle });
      
      // First check if Supabase is properly configured
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          title: sessionTitle
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating session:', error);
        
        // Run database test to provide better error information
        const { testDatabaseConnection } = await import('@/utils/db-test');
        const dbTest = await testDatabaseConnection();
        
        if (!dbTest.success) {
          throw new Error(dbTest.error || '数据库连接测试失败');
        }
        
        // Provide more specific error messages
        if (error.code === '42P01') {
          throw new Error('数据库表不存在，请检查数据库配置');
        } else if (error.code === '23505') {
          throw new Error('会话已存在');
        } else if (error.message.includes('connection')) {
          throw new Error('数据库连接失败，请检查网络连接');
        } else if (error.message.includes('JWT') || error.message.includes('auth')) {
          throw new Error('数据库认证失败，请重新登录');
        } else {
          throw new Error(`创建会话失败: ${error.message}`);
        }
      }

      if (!data) {
        throw new Error('创建会话成功但未返回数据');
      }

      console.log('Session created successfully:', data);

      return {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        messages: [],
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Session creation error:', error);
      throw new Error(`会话创建失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * Get a specific session by ID with user permission check
   * @param sessionId - The session ID
   * @param userId - The user ID for permission check
   * @returns Promise<ChatSession | null> - The session or null if not found
   */
  async getSession(sessionId: string, userId: string): Promise<ChatSession | null> {
    try {
      // Validate session ID format
      if (!this.isValidUUID(sessionId)) {
        return null;
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          user_id,
          title,
          created_at,
          updated_at
        `)
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw new Error(`Failed to get session: ${error.message}`);
      }

      // Get messages for this session
      const messages = await this.getSessionMessages(sessionId);

      return {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        messages,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };
    } catch (error) {
      throw new Error(`Failed to retrieve session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all sessions for a user with pagination
   * @param userId - The user ID
   * @param limit - Maximum number of sessions to return
   * @param offset - Number of sessions to skip
   * @returns Promise<ChatSession[]> - Array of sessions
   */
  async getUserSessions(userId: string, limit: number = 50, offset: number = 0): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          user_id,
          title,
          created_at,
          updated_at
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to get user sessions: ${error.message}`);
      }

      // Convert to ChatSession format (without loading all messages for performance)
      return data.map(session => ({
        id: session.id,
        user_id: session.user_id,
        title: session.title,
        messages: [], // Messages loaded separately when needed
        created_at: new Date(session.created_at),
        updated_at: new Date(session.updated_at)
      }));
    } catch (error) {
      throw new Error(`Failed to retrieve user sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update session properties
   * @param sessionId - The session ID
   * @param updates - Partial session updates
   */
  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) {
        updateData.title = updates.title;
      }

      const { error } = await supabase
        .from('chat_sessions')
        .update(updateData)
        .eq('id', sessionId);

      if (error) {
        throw new Error(`Failed to update session: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Session update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a session and all its messages
   * @param sessionId - The session ID
   * @param userId - The user ID for permission check
   */
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    try {
      // First verify the session belongs to the user
      const session = await this.getSession(sessionId, userId);
      if (!session) {
        throw new Error('Session not found or access denied');
      }

      // Delete the session (messages will be deleted automatically due to CASCADE)
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to delete session: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Session deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate session title based on messages
   * @param messages - Array of chat messages
   * @returns Promise<string> - Generated title
   */
  async generateSessionTitle(messages: ChatHistoryMessage[]): Promise<string> {
    try {
      if (messages.length === 0) {
        return this.generateDefaultTitle();
      }

      // Get the first user message
      const firstUserMessage = messages.find(msg => msg.role === 'user');
      if (!firstUserMessage) {
        return this.generateDefaultTitle();
      }

      // Generate title from first message (truncate if too long)
      let title = firstUserMessage.content.trim();
      
      // Remove line breaks and extra spaces
      title = title.replace(/\s+/g, ' ');
      
      // Truncate if too long
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }

      return title || this.generateDefaultTitle();
    } catch (error) {
      return this.generateDefaultTitle();
    }
  }

  /**
   * Get messages for a specific session
   * @param sessionId - The session ID
   * @returns Promise<ChatHistoryMessage[]> - Array of messages
   */
  private async getSessionMessages(sessionId: string): Promise<ChatHistoryMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('role, content, timestamp')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) {
        throw new Error(`Failed to get session messages: ${error.message}`);
      }

      return data.map(msg => ({
        role: msg.role as 'user' | 'ai',
        content: msg.content,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      // Return empty array if messages can't be loaded
      return [];
    }
  }

  /**
   * Generate a default session title
   * @returns string - Default title with timestamp
   */
  private generateDefaultTitle(): string {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `新对话 ${timeStr}`;
  }

  /**
   * Validate UUID format
   * @param uuid - String to validate
   * @returns boolean - True if valid UUID
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

// Export singleton instance
export const sessionService = new ChatSessionService();