import { useState, useCallback } from 'react'
import { ChatMessage, ComponentType } from './chat-interface'

interface UseChatOptions {
  userId?: string
  initialMessages?: ChatMessage[]
}

interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  sendMessage: (content: string) => Promise<void>
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  addComponentMessage: (content: string, componentType: ComponentType, componentData?: any) => void
  clearMessages: () => void
}

export function useChat({ userId, initialMessages = [] }: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load messages from localStorage on initialization
    if (typeof window !== 'undefined' && userId) {
      try {
        const savedMessages = localStorage.getItem(`chat_messages_${userId}`)
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages)
          // Convert timestamp strings back to Date objects
          return parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }
      } catch (error) {
        console.error('Failed to load chat messages from localStorage:', error)
      }
    }
    return initialMessages
  })
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => {
      // Generate ID based on current message count to avoid hydration issues
      const id = `msg_${prev.length}`
      const newMessage: ChatMessage = {
        ...message,
        id,
        timestamp: new Date(), // This is fine since it's called on user interaction, not during render
      }
      const updatedMessages = [...prev, newMessage]
      
      // Save to localStorage if userId is available
      if (typeof window !== 'undefined' && userId) {
        try {
          localStorage.setItem(`chat_messages_${userId}`, JSON.stringify(updatedMessages))
        } catch (error) {
          console.error('Failed to save chat messages to localStorage:', error)
        }
      }
      
      return updatedMessages
    })
  }, [userId])

  const addComponentMessage = useCallback((
    content: string, 
    componentType: ComponentType, 
    componentData?: any
  ) => {
    addMessage({
      type: 'component',
      content,
      componentType,
      componentData,
      userId,
    })
  }, [addMessage, userId])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // Add user message immediately
    addMessage({
      type: 'user',
      content: content.trim(),
      userId,
    })

    setIsLoading(true)

    try {
      // Simulate AI response for now - will be replaced with actual API call in task 2.3
      await new Promise(resolve => setTimeout(resolve, 1500)) // Fixed delay to avoid hydration issues
      
      // Mock AI response based on content
      const response = generateMockResponse(content)
      
      if (response.componentType) {
        addComponentMessage(response.content, response.componentType, response.componentData)
      } else {
        addMessage({
          type: 'assistant',
          content: response.content,
          userId,
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      addMessage({
        type: 'assistant',
        content: '抱歉，发生了错误。请稍后再试。',
        userId,
      })
    } finally {
      setIsLoading(false)
    }
  }, [addMessage, addComponentMessage, userId])

  const clearMessages = useCallback(() => {
    setMessages([])
    // Clear from localStorage as well
    if (typeof window !== 'undefined' && userId) {
      try {
        localStorage.removeItem(`chat_messages_${userId}`)
      } catch (error) {
        console.error('Failed to clear chat messages from localStorage:', error)
      }
    }
  }, [userId])

  return {
    messages,
    isLoading,
    sendMessage,
    addMessage,
    addComponentMessage,
    clearMessages,
  }
}

// Mock response generator - will be replaced with actual AI integration in task 2.3
function generateMockResponse(userMessage: string): {
  content: string
  componentType?: ComponentType
  componentData?: any
} {
  const message = userMessage.toLowerCase()

  // Career positioning intent detection
  if (message.includes('职业') || message.includes('工作') || message.includes('求职') || 
      message.includes('career') || message.includes('job')) {
    
    if (message.includes('定位') || message.includes('分析') || message.includes('positioning')) {
      return {
        content: '我来帮您进行职业定位分析！首先，请填写一下您的基本信息，这将帮助我更好地了解您的背景。',
        componentType: 'profile-form',
        componentData: {
          sections: ['basic', 'education', 'experience', 'skills']
        }
      }
    }
    
    if (message.includes('测评') || message.includes('评估') || message.includes('assessment')) {
      return {
        content: '让我们通过一个简短的测评来了解您的职业倾向和个性特点。',
        componentType: 'assessment-quiz',
        componentData: {
          templateId: 'career-interest-template',
          questionCount: 15,
          estimatedTime: 10
        }
      }
    }
    
    if (message.includes('推荐') || message.includes('建议') || message.includes('recommendation')) {
      // Import mock data dynamically to avoid build issues
      return {
        content: '基于您的背景和偏好，我为您推荐以下职位：',
        componentType: 'job-recommendations',
        componentData: {
          recommendationsData: null // Will be loaded dynamically
        }
      }
    }
    
    if (message.includes('方向') || message.includes('规划') || message.includes('发展') || message.includes('direction')) {
      return {
        content: '根据您的职业分析和职位偏好，我为您制定了以下职业发展方向：',
        componentType: 'career-directions',
        componentData: {
          directionsData: null // Will be loaded dynamically
        }
      }
    }
  }

  // General conversational responses
  const responses = [
    '您好！我是您的AI职业顾问。我可以帮助您进行职业定位分析、技能评估、求职建议等。请告诉我您需要什么帮助？',
    '我理解您的问题。让我为您提供一些建议...',
    '这是一个很好的问题。基于我的分析...',
    '我来帮您分析一下这个情况。',
  ]

  // Use a deterministic approach to avoid hydration issues
  const responseIndex = userMessage.length % responses.length
  return {
    content: responses[responseIndex]
  }
}