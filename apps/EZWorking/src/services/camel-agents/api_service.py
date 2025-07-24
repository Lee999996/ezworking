"""
FastAPI service for CAMEL.AI Intent Recognition and Routing System.
Provides REST API endpoints for career positioning system.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import logging
import os
from dotenv import load_dotenv

from intent_recognition_agent import IntentRecognitionAgent
from routing_system import RoutingSystem

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="EZWorking Career Positioning API",
    description="CAMEL.AI powered intent recognition and routing system for career positioning",
    version="1.0.0"
)

# Initialize routing system
routing_system = RoutingSystem()

# Request/Response models
class ChatRequest(BaseModel):
    user_id: str
    session_id: str
    message: str
    context: Optional[Dict[str, Any]] = {}

class ChatResponse(BaseModel):
    success: bool
    type: str
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class SessionStatusResponse(BaseModel):
    user_id: str
    session_id: str
    current_workflow: Optional[str]
    workflow_state: str
    conversation_length: int
    is_paused: bool

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": "EZWorking Career Positioning API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": [
            "/chat - Process user messages",
            "/session/{user_id}/{session_id} - Get session status",
            "/health - Health check"
        ]
    }

@app.post("/chat", response_model=ChatResponse)
async def process_chat(request: ChatRequest):
    """
    Process user chat message through intent recognition and routing system.
    
    Args:
        request: Chat request with user_id, session_id, message, and context
        
    Returns:
        ChatResponse with routing decision and appropriate response
    """
    try:
        logger.info(f"Processing chat request for user {request.user_id}, session {request.session_id}")
        
        # Route request through the system
        routing_request = {
            "user_id": request.user_id,
            "session_id": request.session_id,
            "message": request.message,
            "context": request.context
        }
        
        response = await routing_system.route_request(routing_request)
        
        if response.get("success"):
            return ChatResponse(
                success=True,
                type=response.get("type", "unknown"),
                message=response.get("message", ""),
                data={
                    "workflow_state": response.get("workflow_state"),
                    "suggested_actions": response.get("suggested_actions"),
                    "next_step": response.get("next_step"),
                    "context": response.get("context"),
                    "workflow_paused": response.get("workflow_paused"),
                    "resume_option": response.get("resume_option")
                }
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Routing failed: {response.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/session/{user_id}/{session_id}", response_model=SessionStatusResponse)
async def get_session_status(user_id: str, session_id: str):
    """
    Get current session status.
    
    Args:
        user_id: User identifier
        session_id: Session identifier
        
    Returns:
        SessionStatusResponse with current session information
    """
    try:
        status = routing_system.get_session_status(user_id, session_id)
        
        return SessionStatusResponse(
            user_id=status["user_id"],
            session_id=status["session_id"],
            current_workflow=status["current_workflow"],
            workflow_state=status["workflow_state"],
            conversation_length=status["conversation_length"],
            is_paused=status["is_paused"]
        )
        
    except Exception as e:
        logger.error(f"Error getting session status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Test basic functionality
        agent = IntentRecognitionAgent()
        
        return {
            "status": "healthy",
            "service": "EZWorking Career Positioning API",
            "camel_ai": "connected",
            "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
            "timestamp": None  # Would use actual timestamp in production
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    # Run the API server
    uvicorn.run(
        "api_service:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )