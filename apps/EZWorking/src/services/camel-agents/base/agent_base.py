"""
Base agent class for CAMEL.AI integration in EZWorking career positioning system.
Provides common functionality for all specialized agents.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, AsyncGenerator
from camel.agents import ChatAgent
from camel.messages import BaseMessage
from camel.types import RoleType
import json
import logging

logger = logging.getLogger(__name__)


class BaseCareerAgent(ABC):
    """Base class for all career positioning agents."""
    
    def __init__(self, role_name: str, system_prompt: str):
        """Initialize the base agent with CAMEL ChatAgent."""
        self.role_name = role_name
        self.system_prompt = system_prompt
        
        # Create CAMEL system message
        system_message = BaseMessage.make_assistant_message(
            role_name=role_name,
            content=system_prompt
        )
        
        # Initialize CAMEL ChatAgent
        self.agent = ChatAgent(system_message)
        
        logger.info(f"Initialized {role_name} agent")
    
    @abstractmethod
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process a request and return response."""
        pass
    
    def create_user_message(self, content: str, metadata: Optional[Dict[str, Any]] = None) -> BaseMessage:
        """Create a user message for the CAMEL agent."""
        message_content = content
        if metadata:
            message_content = f"{content}\n\nContext: {json.dumps(metadata)}"
        
        return BaseMessage.make_user_message(
            role_name="User",
            content=message_content
        )
    
    async def get_agent_response(self, user_message: BaseMessage) -> str:
        """Get response from CAMEL agent."""
        try:
            response = self.agent.step(user_message)
            return response.msg.content
        except Exception as e:
            logger.error(f"Error getting response from {self.role_name}: {str(e)}")
            raise
    
    async def get_streaming_response(self, user_message: BaseMessage) -> AsyncGenerator[str, None]:
        """Get streaming response from CAMEL agent."""
        try:
            # Note: CAMEL.AI streaming implementation may vary
            # This is a placeholder for streaming functionality
            response = await self.get_agent_response(user_message)
            
            # Simulate streaming by yielding chunks
            words = response.split()
            for i, word in enumerate(words):
                if i == len(words) - 1:
                    yield word
                else:
                    yield word + " "
        except Exception as e:
            logger.error(f"Error getting streaming response from {self.role_name}: {str(e)}")
            raise
    
    def validate_request(self, request: Dict[str, Any], required_fields: list) -> bool:
        """Validate that request contains required fields."""
        for field in required_fields:
            if field not in request:
                logger.warning(f"Missing required field: {field}")
                return False
        return True
    
    def format_error_response(self, error_message: str) -> Dict[str, Any]:
        """Format error response."""
        return {
            "success": False,
            "error": error_message,
            "agent": self.role_name
        }
    
    def format_success_response(self, data: Any) -> Dict[str, Any]:
        """Format success response."""
        return {
            "success": True,
            "data": data,
            "agent": self.role_name
        }