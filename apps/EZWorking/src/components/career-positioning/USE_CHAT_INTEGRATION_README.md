# Enhanced useChat Hook with Chat History Integration

## Overview

The `useChat` hook has been enhanced to integrate seamlessly with the chat history system while maintaining full backward compatibility with existing implementations.

## Features

### ✅ Chat History Integration
- Automatic session management
- Message persistence across page refreshes
- Integration with Supabase storage
- 5-session limit with automatic cleanup

### ✅ Backward Compatibility
- Existing code continues to work without changes
- localStorage fallback for when history is disabled
- Graceful error handling with fallbacks

### ✅ Enhanced Functionality
- Session creation and switching
- Message conversion between formats
- Loading state management
- Error handling with retry mechanisms

## Usage

### Basic Usage (Backward Compatible)
```typescript
import { useChat } from './use-chat'

function ChatComponent() {
  const { messages, sendMessage, isLoading } = useChat({
    userId: 'user-123'
  })
  
  // Works exactly as before
  return (
    <div>
      {messages.map(msg => <div key={msg.id}>{msg.content}</div>)}
      <button onClick={() => sendMessage('Hello')}>Send</button>
    </div>
  )
}
```

### Enhanced Usage with Chat History
```typescript
import { useChat } from './use-chat'

function EnhancedChatComponent() {
  const {
    messages,
    sendMessage,
    isLoading,
    currentSessionId,
    createNewSession,
    switchToSession,
    clearMessages
  } = useChat({
    userId: 'user-123',
    enableHistory: true // Enable chat history (default: true)
  })
  
  return (
    <div>
      <div>Current Session: {currentSessionId}</div>
      <button onClick={() => createNewSession()}>New Chat</button>
      <button onClick={() => clearMessages()}>Clear</button>
      
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.type}:</strong> {msg.content}
        </div>
      ))}
      
      <button 
        onClick={() => sendMessage('Hello')}
        disabled={isLoading}
      >
        Send Message
      </button>
    </div>
  )
}
```

### Disabling Chat History
```typescript
const chat = useChat({
  userId: 'user-123',
  enableHistory: false // Disable history, use localStorage only
})
```

## API Reference

### Options
```typescript
interface UseChatOptions {
  userId?: string
  initialMessages?: ChatMessage[]
  enableHistory?: boolean // Default: true
}
```

### Return Value
```typescript
interface UseChatReturn {
  // Existing properties
  messages: ChatMessage[]
  isLoading: boolean
  sendMessage: (content: string) => Promise<void>
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>
  addComponentMessage: (content: string, componentType: ComponentType, componentData?: any) => Promise<void>
  clearMessages: () => void
  
  // New chat history properties
  currentSessionId: string | null
  createNewSession: () => string
  switchToSession: (sessionId: string) => void
}
```

## Message Format Conversion

The hook automatically converts between `ChatMessage` and `ChatHistoryMessage` formats:

### ChatMessage (UI Format)
```typescript
interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'component'
  content: string
  componentType?: ComponentType
  componentData?: any
  timestamp: Date
  userId?: string
}
```

### ChatHistoryMessage (Storage Format)
```typescript
interface ChatHistoryMessage {
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}
```

## Error Handling

The hook implements comprehensive error handling:

1. **Storage Errors**: Falls back to localStorage when chat history fails
2. **Network Errors**: Continues with local state management
3. **Data Corruption**: Validates and repairs data when possible
4. **Quota Exceeded**: Automatically cleans up old sessions

## Migration Guide

### Existing Code
No changes required! Existing implementations continue to work:

```typescript
// This continues to work exactly as before
const { messages, sendMessage } = useChat({ userId: 'user-123' })
```

### Opt-in to New Features
Simply access the new properties when you need them:

```typescript
const { 
  messages, 
  sendMessage,
  currentSessionId,    // New
  createNewSession     // New
} = useChat({ userId: 'user-123' })
```

## Testing

The integration includes comprehensive tests:

- Unit tests for hook functionality
- Integration tests with chat history service
- Error handling and fallback scenarios
- Backward compatibility verification

Run tests:
```bash
npm run test:run -- src/components/career-positioning/__tests__/use-chat.test.ts
npm run test:run -- src/components/career-positioning/__tests__/use-chat-integration.test.ts
```

## Performance Considerations

- Messages are loaded lazily from chat history
- Local state updates are immediate for responsive UI
- Storage operations are asynchronous and non-blocking
- Automatic cleanup prevents memory leaks

## Requirements Satisfied

This implementation satisfies the following requirements:

- **1.1**: ✅ Automatic message saving to chat history
- **1.2**: ✅ AI response storage with proper formatting
- **4.1**: ✅ Persistent storage with page refresh recovery
- **4.2**: ✅ Fallback to localStorage when needed

## Example Usage

See the example implementation at:
- `src/components/career-positioning/use-chat-example.tsx`
- `src/app/test-use-chat-integration/page.tsx`

Visit `/test-use-chat-integration` to see the integration in action.