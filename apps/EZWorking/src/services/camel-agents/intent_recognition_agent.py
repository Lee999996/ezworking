"""
Intent Recognition Agent for EZWorking Career Positioning System.
Analyzes user input to determine intent and route to appropriate agents or workflows.
"""

from typing import Dict, Any, Optional, List
from enum import Enum
import json
import logging
from base.agent_base import BaseCareerAgent

logger = logging.getLogger(__name__)


class IntentType(Enum):
    """Types of user intents."""
    CAREER_POSITIONING_WORKFLOW = "career_positioning_workflow"
    GENERAL_CONVERSATION = "general_conversation"
    WORKFLOW_QUESTION = "workflow_question"
    CONTEXT_SWITCH = "context_switch"
    HELP_REQUEST = "help_request"


class RoutingDecision(Enum):
    """Routing decisions for user requests."""
    START_WORKFLOW = "start_workflow"
    CONTINUE_CONVERSATION = "continue_conversation"
    EXPLAIN_WORKFLOWS = "explain_workflows"
    SWITCH_CONTEXT = "switch_context"


class IntentRecognitionAgent(BaseCareerAgent):
    """
    CAMEL.AI agent for analyzing user intent and routing conversations.
    Implements Requirements: 5.1, 5.2, 8.1
    """
    
    def __init__(self):
        system_prompt = """You are an expert Intent Recognition Specialist for a career positioning system.

Your role is to analyze user messages and determine their intent to route them to the most appropriate response strategy.

INTENT CATEGORIES:
1. CAREER_POSITIONING_WORKFLOW - User wants to start or continue the structured career assessment process
2. GENERAL_CONVERSATION - User has career-related questions or wants to chat
3. WORKFLOW_QUESTION - User asks about available workflows or processes
4. CONTEXT_SWITCH - User wants to change from one mode to another
5. HELP_REQUEST - User needs help or guidance

WORKFLOW TRIGGERS (indicate CAREER_POSITIONING_WORKFLOW):
- "I want to find suitable jobs"
- "Help me understand my career direction"
- "I need career assessment"
- "What jobs am I suitable for"
- "Career positioning"
- "Find my career path"

CONVERSATION TRIGGERS (indicate GENERAL_CONVERSATION):
- General career advice questions
- Industry information requests
- Resume or interview tips
- Salary discussions
- Career development questions

CONTEXT ANALYSIS:
- Consider conversation history
- Identify if user is already in a workflow
- Detect interruptions or topic changes
- Assess urgency and specificity

RESPONSE FORMAT:
Always respond with a JSON object containing:
{
    "intent": "INTENT_TYPE",
    "confidence": 0.0-1.0,
    "routing_decision": "ROUTING_DECISION",
    "workflow_trigger": true/false,
    "context_switch": true/false,
    "reasoning": "explanation of analysis",
    "suggested_response": "brief suggestion for response approach"
}"""
        
        super().__init__("Intent Recognition Specialist", system_prompt)
    
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process intent recognition request.
        
        Args:
            request: {
                "message": str,
                "context": {
                    "conversation_history": List[Dict],
                    "current_workflow": Optional[str],
                    "user_state": Dict
                }
            }
        """
        try:
            if not self.validate_request(request, ["message"]):
                return self.format_error_response("Missing required field: message")
            
            message = request["message"]
            context = request.get("context", {})
            
            # Analyze intent
            intent_analysis = await self.analyze_intent(message, context)
            
            return self.format_success_response(intent_analysis)
            
        except Exception as e:
            logger.error(f"Error in intent recognition: {str(e)}")
            return self.format_error_response(f"Intent recognition failed: {str(e)}")
    
    async def analyze_intent(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user message intent with context."""
        
        # Prepare context information
        context_info = {
            "conversation_history": context.get("conversation_history", []),
            "current_workflow": context.get("current_workflow"),
            "user_state": context.get("user_state", {}),
            "previous_intents": context.get("previous_intents", [])
        }
        
        # Create analysis prompt
        analysis_prompt = f"""
        Analyze the following user message for intent:
        
        USER MESSAGE: "{message}"
        
        CONTEXT:
        - Conversation History: {json.dumps(context_info["conversation_history"][-3:], ensure_ascii=False)}
        - Current Workflow: {context_info["current_workflow"]}
        - User State: {json.dumps(context_info["user_state"], ensure_ascii=False)}
        
        Provide your analysis in the specified JSON format.
        """
        
        user_message = self.create_user_message(analysis_prompt)
        response = await self.get_agent_response(user_message)
        
        try:
            # Parse JSON response
            intent_data = json.loads(response)
            
            # Validate and enhance response
            return self._validate_and_enhance_intent(intent_data, context_info)
            
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse intent analysis JSON: {response}")
            # Fallback to rule-based analysis
            return self._fallback_intent_analysis(message, context_info)
    
    def _validate_and_enhance_intent(self, intent_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and enhance intent analysis results."""
        
        # Ensure required fields
        required_fields = ["intent", "confidence", "routing_decision", "workflow_trigger"]
        for field in required_fields:
            if field not in intent_data:
                logger.warning(f"Missing field in intent analysis: {field}")
                return self._fallback_intent_analysis("", context)
        
        # Add routing logic
        intent_data["should_enter_workflow"] = self._should_enter_workflow(intent_data, context)
        intent_data["context_switch_needed"] = self._detect_context_switch(intent_data, context)
        
        return intent_data
    
    def _should_enter_workflow(self, intent_data: Dict[str, Any], context: Dict[str, Any]) -> bool:
        """Determine if user should enter structured workflow."""
        
        # Check if already in workflow
        if context.get("current_workflow"):
            return False
        
        # Check intent and confidence
        if (intent_data.get("intent") == "CAREER_POSITIONING_WORKFLOW" and 
            intent_data.get("confidence", 0) > 0.7):
            return True
        
        # Check workflow trigger flag
        return intent_data.get("workflow_trigger", False)
    
    def _detect_context_switch(self, intent_data: Dict[str, Any], context: Dict[str, Any]) -> bool:
        """Detect if user wants to switch context."""
        
        current_workflow = context.get("current_workflow")
        new_intent = intent_data.get("intent")
        
        # Switching from workflow to conversation
        if current_workflow and new_intent == "GENERAL_CONVERSATION":
            return True
        
        # Switching from conversation to workflow
        if not current_workflow and new_intent == "CAREER_POSITIONING_WORKFLOW":
            return True
        
        return intent_data.get("context_switch", False)
    
    def _fallback_intent_analysis(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback rule-based intent analysis."""
        
        message_lower = message.lower()
        
        # Career positioning workflow keywords
        workflow_keywords = [
            "career positioning", "find job", "suitable job", "career assessment",
            "career direction", "job recommendation", "what job", "career path"
        ]
        
        # General conversation keywords
        conversation_keywords = [
            "how to", "what is", "tell me about", "advice", "tip", "help with"
        ]
        
        # Determine intent
        if any(keyword in message_lower for keyword in workflow_keywords):
            intent = "CAREER_POSITIONING_WORKFLOW"
            routing_decision = "START_WORKFLOW"
            workflow_trigger = True
            confidence = 0.8
        elif any(keyword in message_lower for keyword in conversation_keywords):
            intent = "GENERAL_CONVERSATION"
            routing_decision = "CONTINUE_CONVERSATION"
            workflow_trigger = False
            confidence = 0.7
        else:
            intent = "GENERAL_CONVERSATION"
            routing_decision = "CONTINUE_CONVERSATION"
            workflow_trigger = False
            confidence = 0.5
        
        return {
            "intent": intent,
            "confidence": confidence,
            "routing_decision": routing_decision,
            "workflow_trigger": workflow_trigger,
            "context_switch": False,
            "reasoning": "Fallback rule-based analysis",
            "suggested_response": "Provide appropriate response based on intent",
            "should_enter_workflow": workflow_trigger and not context.get("current_workflow"),
            "context_switch_needed": False
        }
    
    def determine_routing(self, intent_analysis: Dict[str, Any]) -> RoutingDecision:
        """Determine routing decision based on intent analysis."""
        
        routing_str = intent_analysis.get("routing_decision", "CONTINUE_CONVERSATION")
        
        try:
            return RoutingDecision(routing_str.lower())
        except ValueError:
            logger.warning(f"Invalid routing decision: {routing_str}")
            return RoutingDecision.CONTINUE_CONVERSATION
    
    def should_enter_workflow(self, intent_analysis: Dict[str, Any]) -> bool:
        """Check if user should enter structured workflow."""
        return intent_analysis.get("should_enter_workflow", False)
    
    async def explain_workflows(self) -> Dict[str, Any]:
        """Provide explanation of available workflows."""
        
        explanation_prompt = """
        Provide a friendly explanation of the career positioning workflow available to users.
        
        Explain:
        1. What the career positioning process involves
        2. How it helps users find suitable jobs
        3. The steps involved (profile collection, assessment, analysis, recommendations)
        4. How to get started
        
        Keep it conversational and encouraging.
        """
        
        user_message = self.create_user_message(explanation_prompt)
        response = await self.get_agent_response(user_message)
        
        return {
            "type": "workflow_explanation",
            "content": response,
            "available_workflows": [
                {
                    "name": "Career Positioning",
                    "description": "Complete career assessment and job matching process",
                    "steps": ["Profile Collection", "Assessment", "Analysis", "Recommendations"]
                }
            ]
        }