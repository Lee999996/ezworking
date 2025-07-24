"""
Test client for the CAMEL.AI Career Positioning API service.
"""

import asyncio
import httpx
import json

API_BASE_URL = "http://localhost:8000"

async def test_api_endpoints():
    """Test all API endpoints."""
    
    async with httpx.AsyncClient() as client:
        print("=== Testing EZWorking Career Positioning API ===\n")
        
        # Test root endpoint
        print("1. Testing root endpoint...")
        try:
            response = await client.get(f"{API_BASE_URL}/")
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}\n")
        except Exception as e:
            print(f"Error: {str(e)}\n")
        
        # Test health check
        print("2. Testing health check...")
        try:
            response = await client.get(f"{API_BASE_URL}/health")
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}\n")
        except Exception as e:
            print(f"Error: {str(e)}\n")
        
        # Test chat endpoint with different scenarios
        chat_tests = [
            {
                "name": "Career Assessment Request",
                "request": {
                    "user_id": "test_user_001",
                    "session_id": "test_session_001",
                    "message": "I want to find jobs that match my skills",
                    "context": {}
                }
            },
            {
                "name": "General Career Question",
                "request": {
                    "user_id": "test_user_002",
                    "session_id": "test_session_002", 
                    "message": "What are the best programming languages to learn?",
                    "context": {}
                }
            },
            {
                "name": "Workflow Information Request",
                "request": {
                    "user_id": "test_user_003",
                    "session_id": "test_session_003",
                    "message": "What can you help me with?",
                    "context": {}
                }
            }
        ]
        
        for i, test in enumerate(chat_tests, 3):
            print(f"{i}. Testing chat endpoint - {test['name']}...")
            try:
                response = await client.post(
                    f"{API_BASE_URL}/chat",
                    json=test["request"]
                )
                print(f"Status: {response.status_code}")
                result = response.json()
                print(f"Success: {result.get('success')}")
                print(f"Type: {result.get('type')}")
                print(f"Message: {result.get('message', '')[:100]}...")
                if result.get('data'):
                    print(f"Data: {json.dumps(result['data'], indent=2)}")
                print()
            except Exception as e:
                print(f"Error: {str(e)}\n")
        
        # Test session status
        print("6. Testing session status...")
        try:
            response = await client.get(f"{API_BASE_URL}/session/test_user_001/test_session_001")
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}\n")
        except Exception as e:
            print(f"Error: {str(e)}\n")

if __name__ == "__main__":
    print("Starting API client tests...")
    print("Make sure the API server is running on http://localhost:8000")
    print("You can start it with: python api_service.py\n")
    
    asyncio.run(test_api_endpoints())