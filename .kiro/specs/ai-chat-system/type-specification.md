# AI聊天系统类型规范

## 设计原则

### 简洁优雅
- 避免过度设计和冗余代码
- 保持类型定义的最小化和必要性
- 优先使用组合而非继承
- 遵循单一职责原则

### 核心类型定义

#### 基础消息类型
```typescript
// 核心消息接口 - 最小化设计
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'failed';
}

// 历史消息格式 - 用于API通信
export interface ChatHistoryMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}
```

#### 会话类型
```typescript
// 聊天会话 - 简化设计
export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  messages: ChatHistoryMessage[];
  created_at: Date;
  updated_at: Date;
}

// 会话摘要 - 用于列表显示
export interface ChatSessionSummary {
  id: string;
  title: string;
  updated_at: Date;
  messageCount: number;
}
```

#### 服务接口
```typescript
// 主要聊天服务 - 核心功能
export interface ChatService {
  createSession(userId: string, title?: string): Promise<string>;
  getSession(sessionId: string): Promise<ChatSession | null>;
  getUserSessions(userId: string): Promise<ChatSession[]>;
  saveMessage(sessionId: string, message: ChatHistoryMessage): Promise<void>;
  generateResponse(content: string, context?: ChatHistoryMessage[]): Promise<string>;
}
```

#### 错误处理
```typescript
// 错误类型 - 简化枚举
export enum ChatErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  MESSAGE_FAILED = 'MESSAGE_FAILED',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface ChatError {
  type: ChatErrorType;
  message: string;
  retryable: boolean;
}
```

#### 状态管理
```typescript
// UI状态 - 最小化状态
export interface ChatState {
  currentSessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: ChatError | null;
}
```

### 工具函数规范

#### 验证函数
```typescript
// 简化验证 - 只验证必要字段
export function validateMessage(message: Partial<ChatMessage>): boolean {
  return !!(message.content && message.content.trim() && message.role);
}

export function validateSession(session: Partial<ChatSession>): boolean {
  return !!(session.id && session.user_id && session.title);
}
```

#### 转换函数
```typescript
// 类型转换 - 简单直接
export function toHistoryMessage(message: ChatMessage): ChatHistoryMessage {
  return {
    role: message.role === 'user' ? 'user' : 'ai',
    content: message.content,
    timestamp: message.timestamp
  };
}

export function toChatMessage(historyMessage: ChatHistoryMessage, id?: string): ChatMessage {
  return {
    id: id || generateId(),
    content: historyMessage.content,
    role: historyMessage.role === 'user' ? 'user' : 'assistant',
    timestamp: historyMessage.timestamp,
    status: 'sent'
  };
}
```

#### 工具函数
```typescript
// ID生成 - 简单实现
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 错误创建 - 标准化
export function createError(type: ChatErrorType, message: string): ChatError {
  return {
    type,
    message,
    retryable: type !== ChatErrorType.VALIDATION_ERROR
  };
}
```

### 常量定义

```typescript
// 配置常量 - 核心配置
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 4000,
  MAX_SESSIONS_PER_USER: 50,
  REQUEST_TIMEOUT: 30000,
  RETRY_LIMIT: 3
} as const;

// 错误消息 - 中文提示
export const ERROR_MESSAGES = {
  [ChatErrorType.NETWORK_ERROR]: '网络连接失败',
  [ChatErrorType.SESSION_NOT_FOUND]: '对话不存在',
  [ChatErrorType.MESSAGE_FAILED]: '消息发送失败',
  [ChatErrorType.AI_SERVICE_ERROR]: 'AI服务暂时不可用',
  [ChatErrorType.VALIDATION_ERROR]: '输入内容无效'
} as const;
```

## 验证规范

### 类型验证测试
参考 `chat-verification.ts` 的验证方式：

```typescript
// 验证核心类型定义
function verifyTypes() {
  // 测试消息类型
  const message: ChatMessage = {
    id: generateId(),
    content: 'Hello world',
    role: 'user',
    timestamp: new Date(),
    status: 'sent'
  };

  // 测试会话类型
  const session: ChatSession = {
    id: generateId(),
    user_id: 'user-123',
    title: 'Test Session',
    messages: [],
    created_at: new Date(),
    updated_at: new Date()
  };

  // 测试服务接口
  const mockService: ChatService = {
    createSession: async () => 'session-id',
    getSession: async () => session,
    getUserSessions: async () => [session],
    saveMessage: async () => {},
    generateResponse: async () => 'AI response'
  };

  // 测试工具函数
  const isValidMessage = validateMessage(message);
  const isValidSession = validateSession(session);
  const historyMessage = toHistoryMessage(message);
  const convertedMessage = toChatMessage(historyMessage);

  console.log('✅ 类型定义验证通过');
  console.log('✅ 消息验证:', isValidMessage);
  console.log('✅ 会话验证:', isValidSession);
  console.log('✅ 类型转换正常');
  console.log('✅ 服务接口可实现');

  return {
    message,
    session,
    mockService,
    isValidMessage,
    isValidSession,
    historyMessage,
    convertedMessage
  };
}
```

### 代码质量要求

1. **类型安全**: 所有接口必须有明确的类型定义
2. **最小化**: 只定义必要的字段和方法
3. **一致性**: 命名和结构保持一致
4. **可扩展**: 设计允许未来扩展但不预先实现
5. **文档化**: 关键接口需要注释说明

### 反模式避免

❌ **避免的设计**:
- 过度抽象的基类和继承层次
- 不必要的泛型参数
- 冗余的接口定义
- 过多的可选参数
- 复杂的联合类型

✅ **推荐的设计**:
- 简单直接的接口定义
- 明确的职责分离
- 最小化的依赖关系
- 清晰的命名约定
- 实用的工具函数

## 实施检查清单

- [ ] 类型定义通过TypeScript编译检查
- [ ] 验证函数测试通过
- [ ] 接口可以被正确实现
- [ ] 工具函数功能正常
- [ ] 常量定义合理
- [ ] 代码风格一致
- [ ] 文档注释完整

## 总结

本规范强调简洁优雅的设计原则，避免过度工程化。通过最小化的类型定义和实用的工具函数，为AI聊天系统提供坚实的类型基础，同时保持代码的可维护性和可扩展性。