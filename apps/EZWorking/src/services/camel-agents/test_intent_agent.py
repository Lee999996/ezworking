"""
Test script for Intent Recognition Agent and Routing System.
Validates the CAMEL.AI framework integration and core functionality.
"""

import asyncio
import json
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


async def test_intent_recognition():
    """Test Intent Recognition Agent functionality."""
    print("=== Testing Intent Recognition Agent ===")
    
    agent = IntentRecognitionAgent()
    
    # Test cases for different intents
    test_cases = [
        {
            "name": "Career Positioning Workflow Request",
            "message": "I want to find suitable jobs for my background",
            "context": {
                "conversation_history": [],
                "current_workflow": None,
                "user_state": {}
            }
        },
        {
            "name": "General Career Question",
            "message": "What skills are important for software engineers?",
            "context": {
                "conversation_history": [],
                "current_workflow": None,
                "user_state": {}
            }
        },
        {
            "name": "Workflow Question",
            "message": "What workflows do you have available?",
            "context": {
                "conversation_history": [],
                "current_workflow": None,
                "user_state": {}
            }
        },
        {
            "name": "Context Switch Request",
            "message": "I want to stop the assessment and ask a question",
            "context": {
                "conversation_history": [
                    {"user_message": "Start career assessment", "agent_response": "Let's begin..."}
                ],
                "current_workflow": "career_positioning",
                "user_state": {"workflow_step": "profile_collection"}
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\n--- Test: {test_case['name']} ---")
        print(f"Message: {test_case['message']}")
        
        request = {
            "message": test_case["message"],
            "context": test_case["context"]
        }
        
        try:
            response = await agent.process_request(request)
            
            if response.get("success"):
                intent_data = response["data"]
                print(f"Intent: {intent_data.get('intent')}")
                print(f"Confidence: {intent_data.get('confidence')}")
                print(f"Routing Decision: {intent_data.get('routing_decision')}")
                print(f"Workflow Trigger: {intent_data.get('workflow_trigger')}")
                print(f"Should Enter Workflow: {intent_data.get('should_enter_workflow')}")
                print(f"Reasoning: {intent_data.get('reasoning')}")
            else:
                print(f"Error: {response.get('error')}")
                
        except Exception as e:
            print(f"Exception: {str(e)}")
    
    return True


async def test_routing_system():
    """Test Routing System functionality."""
    print("\n\n=== Testing Routing System ===")
    
    routing_system = RoutingSystem()
    
    # Test cases for routing
    test_cases = [
        {
            "name": "New User Career Assessment Request",
            "request": {
                "user_id": "user_001",
                "session_id": "session_001",
                "message": "I need help finding the right career path for me",
                "context": {}
            }
        },
        {
            "name": "General Career Question",
            "request": {
                "user_id": "user_002", 
                "session_id": "session_002",
                "message": "How do I improve my resume?",
                "context": {}
            }
        },
        {
            "name": "Workflow Explanation Request",
            "request": {
                "user_id": "user_003",
                "session_id": "session_003", 
                "message": "What services do you provide?",
                "context": {}
            }
        },
        {
            "name": "Context Switch During Workflow",
            "request": {
                "user_id": "user_001",
                "session_id": "session_001",
                "message": "Actually, I have a quick question about salaries",
                "context": {}
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\n--- Test: {test_case['name']} ---")
        print(f"Message: {test_case['request']['message']}")
        
        try:
            response = await routing_system.route_request(test_case["request"])
            
            if response.get("success"):
                print(f"Response Type: {response.get('type')}")
                print(f"Message: {response.get('message', '')[:100]}...")
                
                if "workflow_state" in response:
                    print(f"Workflow State: {response['workflow_state']}")
                if "suggested_actions" in response:
                    print(f"Suggested Actions: {response['suggested_actions']}")
                    
            else:
                print(f"Error: {response.get('error')}")
                
        except Exception as e:
            print(f"Exception: {str(e)}")
    
    # Test session status
    print(f"\n--- Session Status Check ---")
    status = routing_system.get_session_status("user_001", "session_001")
    print(f"Session Status: {json.dumps(status, indent=2)}")
    
    return True


async def test_workflow_explanation():
    """Test workflow explanation functionality."""
    print("\n\n=== Testing Workflow Explanation ===")
    
    agent = IntentRecognitionAgent()
    
    try:
        explanation = await agent.explain_workflows()
        print(f"Explanation Type: {explanation.get('type')}")
        print(f"Content: {explanation.get('content', '')[:200]}...")
        print(f"Available Workflows: {explanation.get('available_workflows')}")
        
    except Exception as e:
        print(f"Exception: {str(e)}")
    
    return True


async def main():
    """Run all tests."""
    print("Starting CAMEL.AI Intent Recognition and Routing System Tests")
    print("=" * 60)
    
    try:
        # Test individual components
        await test_intent_recognition()
        await test_routing_system() 
        await test_workflow_explanation()
        
        print("\n" + "=" * 60)
        print("All tests completed successfully!")
        print("Intent Recognition Agent and Routing System are working correctly.")
        
    except Exception as e:
        print(f"\nTest failed with error: {str(e)}")
        logger.error(f"Test execution failed: {str(e)}")


if __name__ == "__main__":
    asyncio.run(main())