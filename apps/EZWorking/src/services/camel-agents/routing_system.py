"""
Routing System for EZWorking Career Positioning System.
Coordinates request routing between different agents and workflows.
"""

from typing import Dict, Any, Optional, Type
from enum import Enum
import logging
from intent_recognition_agent import IntentRecognitionAgent, IntentType, RoutingDecision

logger = logging.getLogger(__name__)


class AgentType(Enum):
    """Types of agents in the system."""
    INTENT_RECOGNITION = "intent_recognition"
    GENERAL_CONVERSATION = "general_conversation"
    WORKFLOW_ORCHESTRATOR = "workflow_orchestrator"
    USER_MEMORY = "user_memory"
    PROFILE_COLLECTOR = "profile_collector"
    ASSESSMENT = "assessment"
    ANALYSIS = "analysis"
    RECOMMENDATION = "recommendation"


class WorkflowState(Enum):
    """States of workflow execution."""
    IDLE = "idle"
    PROFILE_COLLECTION = "profile_collection"
    ASSESSMENT = "assessment"
    ANALYSIS = "analysis"
    RECOMMENDATION = "recommendation"
    COMPLETED = "completed"


class RoutingSystem:
    """
    Central routing system for managing agent interactions and workflow coordination.
    Implements Requirements: 5.1, 5.2, 8.1
    """
    
    def __init__(self):
        self.intent_agent = IntentRecognitionAgent()
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        
        # Agent registry (will be populated as agents are implemented)
        self.agents: Dict[AgentType, Any] = {
            AgentType.INTENT_RECOGNITION: self.intent_agent
        }
        
        logger.info("Routing system initialized")
    
    def register_agent(self, agent_type: AgentType, agent_instance: Any):
        """Register an agent with the routing system."""
        self.agents[agent_type] = agent_instance
        logger.info(f"Registered agent: {agent_type.value}")
    
    async def route_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Route incoming request to appropriate agent or workflow.
        
        Args:
            request: {
                "user_id": str,
                "session_id": str,
                "message": str,
                "context": Dict[str, Any]
            }
        """
        try:
            user_id = request.get("user_id")
            session_id = request.get("session_id")
            message = request.get("message")
            
            if not all([user_id, session_id, message]):
                return self._format_error("Missing required fields: user_id, session_id, message")
            
            # Get or create session context
            session_context = self._get_session_context(user_id, session_id)
            
            # Analyze intent
            intent_request = {
                "message": message,
                "context": {
                    "conversation_history": session_context.get("conversation_history", []),
                    "current_workflow": session_context.get("current_workflow"),
                    "user_state": session_context.get("user_state", {}),
                    "previous_intents": session_context.get("previous_intents", [])
                }
            }
            
            intent_response = await self.intent_agent.process_request(intent_request)
            
            if not intent_response.get("success"):
                return intent_response
            
            intent_analysis = intent_response["data"]
            
            # Update session with intent history
            self._update_session_intent_history(user_id, session_id, intent_analysis)
            
            # Route based on intent analysis
            routing_response = await self._execute_routing_decision(
                user_id, session_id, message, intent_analysis, session_context
            )
            
            # Update conversation history
            self._update_conversation_history(user_id, session_id, message, routing_response)
            
            return routing_response
            
        except Exception as e:
            logger.error(f"Error in routing request: {str(e)}")
            return self._format_error(f"Routing failed: {str(e)}")
    
    async def _execute_routing_decision(
        self, 
        user_id: str, 
        session_id: str, 
        message: str,
        intent_analysis: Dict[str, Any],
        session_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute the routing decision based on intent analysis."""
        
        routing_decision = intent_analysis.get("routing_decision")
        should_enter_workflow = intent_analysis.get("should_enter_workflow", False)
        context_switch_needed = intent_analysis.get("context_switch_needed", False)
        
        # Handle workflow entry
        if should_enter_workflow:
            return await self._start_workflow(user_id, session_id, message, intent_analysis)
        
        # Handle context switching
        if context_switch_needed:
            return await self._handle_context_switch(user_id, session_id, message, intent_analysis, session_context)
        
        # Handle different routing decisions
        if routing_decision == "START_WORKFLOW":
            return await self._start_workflow(user_id, session_id, message, intent_analysis)
        
        elif routing_decision == "CONTINUE_CONVERSATION":
            return await self._continue_conversation(user_id, session_id, message, intent_analysis)
        
        elif routing_decision == "EXPLAIN_WORKFLOWS":
            return await self._explain_workflows(user_id, session_id, message)
        
        elif routing_decision == "SWITCH_CONTEXT":
            return await self._handle_context_switch(user_id, session_id, message, intent_analysis, session_context)
        
        else:
            # Default to conversation
            return await self._continue_conversation(user_id, session_id, message, intent_analysis)
    
    async def _start_workflow(
        self, 
        user_id: str, 
        session_id: str, 
        message: str,
        intent_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Start the career positioning workflow."""
        
        # Update session state
        self._update_session_workflow_state(user_id, session_id, WorkflowState.PROFILE_COLLECTION)
        
        # Check if workflow orchestrator is available
        if AgentType.WORKFLOW_ORCHESTRATOR not in self.agents:
            return {
                "success": True,
                "type": "workflow_start_pending",
                "message": "I'll help you with career positioning! The workflow system is being initialized. Let me start by collecting some information about your background.",
                "next_step": "profile_collection",
                "workflow_state": WorkflowState.PROFILE_COLLECTION.value
            }
        
        # Route to workflow orchestrator
        orchestrator = self.agents[AgentType.WORKFLOW_ORCHESTRATOR]
        return await orchestrator.initialize_workflow(user_id, session_id, message)
    
    async def _continue_conversation(
        self, 
        user_id: str, 
        session_id: str, 
        message: str,
        intent_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Continue general conversation."""
        
        # Check if general conversation agent is available
        if AgentType.GENERAL_CONVERSATION not in self.agents:
            return {
                "success": True,
                "type": "conversation_pending",
                "message": "I'm here to help with your career questions! The conversation system is being set up. In the meantime, would you like to start our career positioning process to find jobs that match your profile?",
                "suggested_actions": ["Start Career Assessment", "Ask Another Question"]
            }
        
        # Route to general conversation agent
        conversation_agent = self.agents[AgentType.GENERAL_CONVERSATION]
        return await conversation_agent.generate_response(user_id, session_id, message)
    
    async def _explain_workflows(self, user_id: str, session_id: str, message: str) -> Dict[str, Any]:
        """Explain available workflows to the user."""
        
        explanation = await self.intent_agent.explain_workflows()
        
        return {
            "success": True,
            "type": "workflow_explanation",
            "message": explanation["content"],
            "available_workflows": explanation["available_workflows"],
            "suggested_actions": ["Start Career Positioning", "Ask Questions", "Learn More"]
        }
    
    async def _handle_context_switch(
        self, 
        user_id: str, 
        session_id: str, 
        message: str,
        intent_analysis: Dict[str, Any],
        session_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle context switching between workflow and conversation."""
        
        current_workflow = session_context.get("current_workflow")
        new_intent = intent_analysis.get("intent")
        
        if current_workflow and new_intent == "GENERAL_CONVERSATION":
            # Switching from workflow to conversation
            self._pause_workflow(user_id, session_id)
            return {
                "success": True,
                "type": "context_switch",
                "message": "I've paused the career positioning process. What would you like to know?",
                "context": "conversation",
                "workflow_paused": True,
                "resume_option": True
            }
        
        elif not current_workflow and new_intent == "CAREER_POSITIONING_WORKFLOW":
            # Switching from conversation to workflow
            return await self._start_workflow(user_id, session_id, message, intent_analysis)
        
        else:
            # Continue current context
            if current_workflow:
                return await self._continue_workflow(user_id, session_id, message)
            else:
                return await self._continue_conversation(user_id, session_id, message, intent_analysis)
    
    async def _continue_workflow(self, user_id: str, session_id: str, message: str) -> Dict[str, Any]:
        """Continue existing workflow."""
        
        session_context = self._get_session_context(user_id, session_id)
        workflow_state = session_context.get("workflow_state", WorkflowState.IDLE)
        
        # Route to appropriate workflow agent based on current state
        if workflow_state == WorkflowState.PROFILE_COLLECTION:
            if AgentType.PROFILE_COLLECTOR in self.agents:
                agent = self.agents[AgentType.PROFILE_COLLECTOR]
                return await agent.process_request({"user_id": user_id, "session_id": session_id, "message": message})
        
        elif workflow_state == WorkflowState.ASSESSMENT:
            if AgentType.ASSESSMENT in self.agents:
                agent = self.agents[AgentType.ASSESSMENT]
                return await agent.process_request({"user_id": user_id, "session_id": session_id, "message": message})
        
        # Default response if specific agent not available
        return {
            "success": True,
            "type": "workflow_continuation",
            "message": f"Continuing with {workflow_state.value} phase. The system is being set up to handle your request.",
            "workflow_state": workflow_state.value
        }
    
    def _get_session_context(self, user_id: str, session_id: str) -> Dict[str, Any]:
        """Get or create session context."""
        
        session_key = f"{user_id}:{session_id}"
        
        if session_key not in self.active_sessions:
            self.active_sessions[session_key] = {
                "user_id": user_id,
                "session_id": session_id,
                "current_workflow": None,
                "workflow_state": WorkflowState.IDLE,
                "conversation_history": [],
                "user_state": {},
                "previous_intents": [],
                "created_at": None,
                "updated_at": None
            }
        
        return self.active_sessions[session_key]
    
    def _update_session_workflow_state(self, user_id: str, session_id: str, workflow_state: WorkflowState):
        """Update session workflow state."""
        
        session_context = self._get_session_context(user_id, session_id)
        session_context["current_workflow"] = "career_positioning" if workflow_state != WorkflowState.IDLE else None
        session_context["workflow_state"] = workflow_state
    
    def _update_session_intent_history(self, user_id: str, session_id: str, intent_analysis: Dict[str, Any]):
        """Update session intent history."""
        
        session_context = self._get_session_context(user_id, session_id)
        intent_history = session_context.get("previous_intents", [])
        
        intent_record = {
            "intent": intent_analysis.get("intent"),
            "confidence": intent_analysis.get("confidence"),
            "timestamp": None  # Would use actual timestamp in production
        }
        
        intent_history.append(intent_record)
        
        # Keep only last 10 intents
        if len(intent_history) > 10:
            intent_history = intent_history[-10:]
        
        session_context["previous_intents"] = intent_history
    
    def _update_conversation_history(
        self, 
        user_id: str, 
        session_id: str, 
        user_message: str, 
        agent_response: Dict[str, Any]
    ):
        """Update conversation history."""
        
        session_context = self._get_session_context(user_id, session_id)
        history = session_context.get("conversation_history", [])
        
        conversation_entry = {
            "user_message": user_message,
            "agent_response": agent_response.get("message", ""),
            "response_type": agent_response.get("type", "unknown"),
            "timestamp": None  # Would use actual timestamp in production
        }
        
        history.append(conversation_entry)
        
        # Keep only last 20 conversation entries
        if len(history) > 20:
            history = history[-20:]
        
        session_context["conversation_history"] = history
    
    def _pause_workflow(self, user_id: str, session_id: str):
        """Pause current workflow."""
        
        session_context = self._get_session_context(user_id, session_id)
        session_context["workflow_paused"] = True
    
    def _format_error(self, message: str) -> Dict[str, Any]:
        """Format error response."""
        return {
            "success": False,
            "error": message,
            "type": "routing_error"
        }
    
    def get_session_status(self, user_id: str, session_id: str) -> Dict[str, Any]:
        """Get current session status."""
        
        session_context = self._get_session_context(user_id, session_id)
        
        return {
            "user_id": user_id,
            "session_id": session_id,
            "current_workflow": session_context.get("current_workflow"),
            "workflow_state": session_context.get("workflow_state", WorkflowState.IDLE).value,
            "conversation_length": len(session_context.get("conversation_history", [])),
            "is_paused": session_context.get("workflow_paused", False)
        }