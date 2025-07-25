import type { AIResponseService, ChatHistoryMessage } from '../../types/chat';

/**
 * AI Response service for generating chat responses
 * Currently implements temporary fixed responses, designed for future AI integration
 */
export class ChatAIResponseService implements AIResponseService {
  
  private readonly FIXED_RESPONSE = "目前还未完成，请期待";
  private readonly MIN_RESPONSE_DELAY = 800; // Minimum delay in milliseconds
  private readonly MAX_RESPONSE_DELAY = 2000; // Maximum delay in milliseconds

  /**
   * Generate AI response for user input
   * Currently returns a fixed response with simulated delay
   * @param prompt - User input prompt
   * @param context - Optional conversation context
   * @returns Promise<string> - AI response
   */
  async generateResponse(prompt: string, context?: ChatHistoryMessage[]): Promise<string> {
    try {
      // Validate input
      if (!this.validateInput(prompt)) {
        throw new Error('Invalid input provided');
      }

      // Simulate realistic response delay
      await this.simulateResponseDelay();

      // For now, return fixed response
      // In future implementation, this would call actual AI service
      const response = await this.processAIRequest(prompt, context);
      
      return this.formatResponse(response);
    } catch (error) {
      throw new Error(`AI response generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate user input before processing
   * @param content - User input content
   * @returns boolean - True if input is valid
   */
  validateInput(content: string): boolean {
    if (!content || typeof content !== 'string') {
      return false;
    }

    const trimmedContent = content.trim();
    
    // Check if content is not empty
    if (trimmedContent.length === 0) {
      return false;
    }

    // Check maximum length (same as message validation)
    if (trimmedContent.length > 10000) {
      return false;
    }

    // Check for potentially harmful content (basic validation)
    if (this.containsHarmfulContent(trimmedContent)) {
      return false;
    }

    return true;
  }

  /**
   * Format AI response before returning
   * @param response - Raw AI response
   * @returns string - Formatted response
   */
  formatResponse(response: string): string {
    if (!response || typeof response !== 'string') {
      return this.FIXED_RESPONSE;
    }

    // Trim whitespace
    let formatted = response.trim();

    // Ensure response is not empty
    if (formatted.length === 0) {
      return this.FIXED_RESPONSE;
    }

    // Basic formatting improvements
    formatted = this.improveFormatting(formatted);

    return formatted;
  }

  /**
   * Get AI service status and capabilities
   * @returns Object with service information
   */
  getServiceInfo(): {
    isAvailable: boolean;
    version: string;
    capabilities: string[];
    limitations: string[];
  } {
    return {
      isAvailable: true,
      version: '1.0.0-temp',
      capabilities: [
        'Basic text responses',
        'Input validation',
        'Response formatting',
        'Simulated delay'
      ],
      limitations: [
        'Fixed response only',
        'No actual AI processing',
        'No context understanding',
        'No personalization'
      ]
    };
  }

  /**
   * Check if AI service is ready to process requests
   * @returns Promise<boolean> - True if service is ready
   */
  async isServiceReady(): Promise<boolean> {
    try {
      // For temporary implementation, always return true
      // In future, this would check actual AI service availability
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get response time estimate based on input
   * @param prompt - User input
   * @param context - Optional context
   * @returns number - Estimated response time in milliseconds
   */
  getEstimatedResponseTime(prompt: string, context?: ChatHistoryMessage[]): number {
    // For temporary implementation, return random delay within range
    return Math.floor(Math.random() * (this.MAX_RESPONSE_DELAY - this.MIN_RESPONSE_DELAY)) + this.MIN_RESPONSE_DELAY;
  }

  /**
   * Process AI request (placeholder for future AI integration)
   * @param prompt - User input
   * @param context - Conversation context
   * @returns Promise<string> - AI response
   */
  private async processAIRequest(prompt: string, context?: ChatHistoryMessage[]): Promise<string> {
    // This is where actual AI processing would happen
    // For now, return the fixed response
    
    // Log context for future development (in development mode only)
    if (process.env.NODE_ENV === 'development') {
      console.log('AI Request:', {
        prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
        contextLength: context?.length || 0,
        timestamp: new Date().toISOString()
      });
    }

    return this.FIXED_RESPONSE;
  }

  /**
   * Simulate realistic response delay
   * @returns Promise<void>
   */
  private async simulateResponseDelay(): Promise<void> {
    const delay = this.getEstimatedResponseTime('');
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Check for potentially harmful content (basic implementation)
   * @param content - Content to check
   * @returns boolean - True if content might be harmful
   */
  private containsHarmfulContent(content: string): boolean {
    // Basic harmful content detection
    // In a real implementation, this would be more sophisticated
    const harmfulPatterns = [
      /\b(hack|exploit|malware|virus)\b/i,
      /\b(password|credit card|ssn)\b/i,
      // Add more patterns as needed
    ];

    return harmfulPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Improve response formatting
   * @param response - Raw response
   * @returns string - Improved response
   */
  private improveFormatting(response: string): string {
    let formatted = response;

    // Remove excessive whitespace
    formatted = formatted.replace(/\s+/g, ' ');

    // Ensure proper sentence ending
    if (!/[.!?]$/.test(formatted)) {
      formatted += '。';
    }

    // Capitalize first letter if needed
    if (formatted.length > 0) {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    return formatted;
  }

  /**
   * Prepare service for future AI integration
   * This method sets up the interface for real AI service integration
   */
  async prepareForAIIntegration(): Promise<{
    interfaceReady: boolean;
    requiredConfig: string[];
    nextSteps: string[];
  }> {
    return {
      interfaceReady: true,
      requiredConfig: [
        'AI_SERVICE_URL',
        'AI_SERVICE_API_KEY',
        'AI_MODEL_NAME',
        'AI_MAX_TOKENS',
        'AI_TEMPERATURE'
      ],
      nextSteps: [
        'Configure AI service credentials',
        'Implement actual AI API calls',
        'Add context processing logic',
        'Implement response streaming',
        'Add error handling for AI service',
        'Implement rate limiting',
        'Add response caching'
      ]
    };
  }

  /**
   * Test the service with sample inputs
   * @returns Promise with test results
   */
  async runServiceTests(): Promise<{
    passed: number;
    failed: number;
    results: Array<{ test: string; passed: boolean; error?: string }>;
  }> {
    const tests = [
      { name: 'Valid input test', input: 'Hello, how are you?' },
      { name: 'Empty input test', input: '' },
      { name: 'Long input test', input: 'A'.repeat(5000) },
      { name: 'Special characters test', input: 'Hello! How are you? 你好吗？' }
    ];

    const results = [];
    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const response = await this.generateResponse(test.input);
        const testPassed = typeof response === 'string' && response.length > 0;
        
        results.push({
          test: test.name,
          passed: testPassed
        });

        if (testPassed) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        results.push({
          test: test.name,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        failed++;
      }
    }

    return { passed, failed, results };
  }
}

// Export singleton instance
export const aiResponseService = new ChatAIResponseService();