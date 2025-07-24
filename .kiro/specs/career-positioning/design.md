# Career Positioning Feature Design Document

## Overview

<<<<<<< HEAD
The Career Positioning feature implements an intelligent Multi-Agent system architecture using CAMEL.AI framework that combines structured workflows with flexible conversational AI. The system features an Intent Recognition Agent that routes users to appropriate specialized agents or workflows, while supporting real-time streaming responses. It consists of a React + Next.js frontend with Supabase backend, integrated with multiple CAMEL agents that work together to provide both structured career positioning workflows and general conversational assistance.
=======
The Career Positioning feature is built as a ChatGPT-like conversational interface where users engage in natural dialogue with an AI assistant. The system dynamically renders interactive components (forms, assessments, analysis displays) within chat messages when career positioning analysis is needed. The architecture prioritizes conversational flow while providing structured data collection and intelligent career guidance capabilities.
>>>>>>> 609115d70e1da7887b8601161caf82b54b85e060

## Architecture

### System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        ChatInterface[ChatGPT-like Interface]
        MessageList[Message History]
        InputField[Message Input]
        InteractiveComponents[Dynamic Form Components]
    end
    
    subgraph "AI Processing Layer"
        ConversationalAI[Conversational AI Engine]
        IntentRecognition[Career Intent Recognition]
        ComponentRenderer[Dynamic Component Renderer]
        ContextManager[Conversation Context Manager]
    end
    
    subgraph "Backend Layer"
        ChatAPI[Chat API Routes]
        CareerAPI[Career Analysis API]
        RealtimeUpdates[WebSocket/SSE Updates]
        Database[(Supabase Database)]
    end
    
<<<<<<< HEAD
    subgraph "CAMEL.AI Agent Layer"
        ManagerAgent[Manager Agent]
        ConversationAgent[General Conversation Agent]
        MemoryAgent[User Memory Agent]
        ProfileAgent[Profile Collector Agent]
        AssessmentAgent[Assessment Agent]
        AnalysisAgent[Analysis Agent]
        RecommendationAgent[Recommendation Agent]
        StreamManager[Streaming Response Manager]
    end
    
    UI --> API
    API --> Auth
    API --> DB
    API --> ManagerAgent
    ManagerAgent --> ConversationAgent
    ManagerAgent --> ProfileAgent
    ManagerAgent --> AssessmentAgent
    ManagerAgent --> AnalysisAgent
    ManagerAgent --> RecommendationAgent
    
    ConversationAgent --> StreamManager
    ProfileAgent --> StreamManager
    AssessmentAgent --> StreamManager
    AnalysisAgent --> StreamManager
    RecommendationAgent --> StreamManager
    StreamManager --> API
    
    ConversationAgent --> MemoryAgent
    ProfileAgent --> MemoryAgent
    AssessmentAgent --> MemoryAgent
    AnalysisAgent --> MemoryAgent
    RecommendationAgent --> MemoryAgent
    MemoryAgent --> DB
    
    ProfileAgent --> DB
    AssessmentAgent --> DB
    AnalysisAgent --> DB
    RecommendationAgent --> DB
=======
    ChatInterface --> MessageList
    ChatInterface --> InputField
    MessageList --> InteractiveComponents
    InputField --> ConversationalAI
    ConversationalAI --> IntentRecognition
    IntentRecognition --> ComponentRenderer
    ComponentRenderer --> InteractiveComponents
    ConversationalAI --> ContextManager
    ConversationalAI --> ChatAPI
    ChatAPI --> CareerAPI
    CareerAPI --> Database
    RealtimeUpdates --> ChatInterface
>>>>>>> 609115d70e1da7887b8601161caf82b54b85e060
```

### Technology Stack

- **Frontend**: React + Next.js with ChatGPT-like interface using Chakra UI
- **Chat System**: Real-time messaging with WebSocket/Server-Sent Events
- **AI Integration**: OpenAI API or similar for conversational AI
- **Backend**: Next.js API Routes with Supabase
- **Database**: Supabase (PostgreSQL) for chat history and career data
- **Authentication**: Supabase Auth
<<<<<<< HEAD
- **AI Agents**: CAMEL.AI Framework
- **Real-time**: Supabase Realtime (for agent status updates) + Server-Sent Events (SSE)
- **UI Framework**: Hybrid GUI/LUI approach combining conversational and visual interfaces
- **Styling**: Tailwind CSS (based on existing codebase pattern)
- **Streaming**: Real-time token streaming with structured data rendering
=======
- **Real-time**: Supabase Realtime for live chat updates
- **Styling**: Chakra UI for consistent design system
>>>>>>> 609115d70e1da7887b8601161caf82b54b85e060

### System Communication Flow

#### Manager Agent Coordination Flow
```mermaid
sequenceDiagram
<<<<<<< HEAD
    participant U as User (React UI)
    participant API as Next.js API (SSE)
    participant MA as Manager Agent
    participant CA as Conversation Agent
    participant PA as Profile Agent
    participant SM as Stream Manager
    participant DB as Supabase DB

    U->>API: Send Message
    API->>MA: Analyze User Request
    MA->>MA: Determine Required Agents & Strategy
    
    alt General Conversation
        MA->>CA: Delegate to Conversation Agent
        CA->>MA: Response Ready
        MA->>SM: Coordinate Stream Response
        SM->>API: Real-time Streaming
        API->>U: Stream Response to UI
    else Career Positioning Workflow
        MA->>PA: Initialize Profile Collection
        MA->>DB: Create/Update Session
        PA->>MA: Profile Collection Ready
        MA->>SM: Stream Workflow Start
        SM->>API: Stream Status Update
        API->>U: Stream Workflow Progress
    else Multi-Agent Collaboration
        MA->>PA: Request Profile Data
        MA->>CA: Request Conversational Context
        MA->>MA: Synthesize Agent Responses
        MA->>SM: Stream Coordinated Response
        SM->>API: Stream Unified Response
        API->>U: Stream Collaborative Result
    end
```

#### Manager Agent Orchestrated Workflow Flow
```mermaid
sequenceDiagram
    participant U as User (React UI)
    participant API as Next.js API (SSE)
    participant MA as Manager Agent
    participant PC as Profile Collector Agent
    participant AS as Assessment Agent
    participant AN as Analysis Agent
    participant RC as Recommendation Agent
    participant SM as Stream Manager
    participant DB as Supabase DB

    U->>API: Start Career Positioning Workflow
    API->>MA: Initialize Career Positioning
    MA->>DB: Create Session Record
    MA->>PC: Delegate Profile Collection
    PC->>MA: Profile Collection Ready
    MA->>SM: Stream Welcome Message
    SM->>API: Stream to User
    API->>U: Stream Profile Collection Start
    
    U->>API: Submit Profile Data
    API->>MA: Process Profile Request
    MA->>PC: Validate Profile Data
    PC->>PC: Validate & Structure Data
    PC->>MA: Validation Complete
    MA->>SM: Stream Validation Results
    SM->>API: Stream Progress Update
    API->>U: Stream Validation Feedback
    MA->>DB: Store Profile Data
    
    MA->>AS: Request Assessment Generation
    AS->>MA: Assessment Questions Ready
    MA->>SM: Stream Question Generation
    SM->>API: Stream Questions
    API->>U: Stream Assessment Questions
    
    U->>API: Submit Assessment Answers
    API->>MA: Process Assessment Request
    MA->>AS: Score Assessment Results
    AS->>AS: Score & Interpret Results
    AS->>MA: Assessment Analysis Complete
    MA->>SM: Stream Analysis Progress
    SM->>API: Stream Assessment Analysis
    API->>U: Stream Assessment Results
    MA->>DB: Store Assessment Results
    
    MA->>AN: Request Career Analysis
    AN->>MA: Request User Data
    MA->>DB: Retrieve All User Data
    MA->>AN: Provide Complete User Context
    AN->>AN: Generate Career Profile
    AN->>MA: Career Analysis Complete
    MA->>SM: Stream Analysis Insights
    SM->>API: Stream Career Analysis
    API->>U: Stream Career Profile
    MA->>DB: Store Analysis Results
    
    MA->>RC: Request Job Recommendations
    RC->>MA: Request Career Analysis
    MA->>RC: Provide Career Analysis Context
    RC->>RC: Generate Recommendations
    RC->>MA: Recommendations Ready
    MA->>SM: Stream Recommendations
    SM->>API: Stream Job Matches
    API->>U: Stream Job Recommendations
    
    U->>API: Provide Feedback on Jobs
    API->>MA: Process User Feedback
    MA->>RC: Refine Recommendations
    RC->>RC: Refine Recommendations
    RC->>MA: Refined Results Ready
    MA->>SM: Stream Refined Results
    SM->>API: Stream Final Directions
    API->>U: Stream Career Directions
    MA->>DB: Store Final Career Directions
=======
    participant U as User
    participant Chat as Chat Interface
    participant AI as Conversational AI
    participant API as Backend API
    participant DB as Database

    U->>Chat: Send Message
    Chat->>AI: Process Message
    AI->>AI: Analyze Intent
    
    alt Regular Conversation
        AI->>Chat: Return Text Response
        Chat->>U: Display Message
    else Career Positioning Intent
        AI->>API: Initialize Career Session
        API->>DB: Create Session Record
        AI->>Chat: Return Message + Profile Form Component
        Chat->>U: Display Message with Form
        
        U->>Chat: Submit Profile Form
        Chat->>API: Send Profile Data
        API->>DB: Store Profile Data
        API->>AI: Process Profile
        AI->>Chat: Return Message + Assessment Component
        Chat->>U: Display Assessment
        
        U->>Chat: Complete Assessment
        Chat->>API: Send Assessment Data
        API->>DB: Store Assessment Results
        API->>AI: Generate Analysis
        AI->>Chat: Return Message + Analysis Component
        Chat->>U: Display Analysis
        
        U->>Chat: Request Recommendations
        Chat->>API: Generate Recommendations
        API->>AI: Create Job Matches
        AI->>Chat: Return Message + Recommendations Component
        Chat->>U: Display Job Recommendations
        
        U->>Chat: Provide Feedback
        Chat->>API: Process Preferences
        API->>AI: Refine Recommendations
        AI->>Chat: Return Final Career Directions
        Chat->>U: Display Career Plan
    end
>>>>>>> 609115d70e1da7887b8601161caf82b54b85e060
```

## Components and Interfaces

### Frontend Components (React + Next.js)

#### 1. Chat Interface Components
```typescript
// Main chat interface
interface ChatInterface {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  isLoading: boolean
  userId: string
}

<<<<<<< HEAD
// Components structure - Hybrid GUI/LUI Interface
interface CareerPositioningComponents {
  ChatInterface: React.FC<ChatInterfaceProps>
  StreamingMessage: React.FC<StreamingMessageProps>
  AssessmentCard: React.FC<AssessmentCardProps>
  JobRecommendationCard: React.FC<JobRecommendationCardProps>
  AnalysisVisualization: React.FC<AnalysisVisualizationProps>
  InteractiveWorkflowCards: React.FC<WorkflowCardProps>
  ConversationalFeedback: React.FC<FeedbackProps>
=======
// Chat message types
interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'component'
  content: string
  component?: ComponentType
  timestamp: Date
  userId: string
}

// Dynamic component types
type ComponentType = 
  | 'profile-form'
  | 'assessment-quiz' 
  | 'analysis-display'
  | 'job-recommendations'
  | 'career-directions'

// Interactive components that render within chat messages
interface InteractiveComponents {
  ProfileFormComponent: React.FC<ProfileFormProps>
  AssessmentComponent: React.FC<AssessmentProps>
  AnalysisComponent: React.FC<AnalysisProps>
  RecommendationsComponent: React.FC<RecommendationsProps>
  CareerDirectionsComponent: React.FC<CareerDirectionsProps>
>>>>>>> 609115d70e1da7887b8601161caf82b54b85e060
}
```

#### 2. API Routes (Next.js) - Hybrid Response Format
```typescript
<<<<<<< HEAD
// app/api/career-positioning/chat/route.ts
interface ChatAPI {
  POST: (request: Request) => Promise<Response> // Send message with streaming response
}

// app/api/career-positioning/stream/route.ts
interface StreamingAPI {
  GET: (request: Request) => Promise<Response>  // SSE endpoint for real-time streaming
}

// Response format for hybrid UI
interface HybridResponse {
  type: 'conversation' | 'card' | 'mixed'
  content: {
    text?: string // For streaming conversational content
    cards?: CardData[] // For structured visual components
    metadata?: ResponseMetadata
  }
}

interface CardData {
  type: 'assessment' | 'job_recommendation' | 'analysis_chart'
  data: any
  actions?: CardAction[]
=======
// app/api/chat/route.ts
interface ChatAPI {
  POST: (request: Request) => Promise<Response> // Send message
  GET: (request: Request) => Promise<Response>  // Get chat history
}

// app/api/chat/stream/route.ts
interface StreamingChatAPI {
  POST: (request: Request) => Promise<Response> // Streaming responses
}

// app/api/career/profile/route.ts
interface CareerProfileAPI {
  POST: (request: Request) => Promise<Response> // Submit profile data
  GET: (request: Request) => Promise<Response>  // Get profile data
}

// app/api/career/assessment/route.ts
interface AssessmentAPI {
  POST: (request: Request) => Promise<Response> // Submit assessment
  GET: (request: Request) => Promise<Response>  // Get assessment results
}

// app/api/career/analysis/route.ts
interface AnalysisAPI {
  POST: (request: Request) => Promise<Response> // Generate analysis
  GET: (request: Request) => Promise<Response>  // Get analysis results
>>>>>>> 609115d70e1da7887b8601161caf82b54b85e060
}
```

### Backend Integration (Supabase)

#### 1. Database Schema
```sql
-- Chat conversations table
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id),
  user_id UUID REFERENCES auth.users(id),
  type TEXT CHECK (type IN ('user', 'assistant', 'component')),
  content TEXT,
  component_type TEXT,
  component_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career positioning sessions table
CREATE TABLE career_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  conversation_id UUID REFERENCES chat_conversations(id),
  status TEXT DEFAULT 'active',
  current_phase TEXT,
  profile_data JSONB,
  assessment_data JSONB,
  analysis_data JSONB,
  recommendations_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User career profiles table
CREATE TABLE user_career_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id UUID REFERENCES career_sessions(id),
  basic_info JSONB,
  education JSONB,
  experience JSONB,
  skills JSONB,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment results table
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id UUID REFERENCES career_sessions(id),
  questions JSONB,
  answers JSONB,
  scores JSONB,
  personality_profile JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career analysis table
CREATE TABLE career_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id UUID REFERENCES career_sessions(id),
  personality_analysis JSONB,
  strengths_analysis JSONB,
  career_tendencies JSONB,
  job_fit_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job recommendations table
CREATE TABLE job_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id UUID REFERENCES career_sessions(id),
  initial_recommendations JSONB,
  user_feedback JSONB,
  refined_recommendations JSONB,
  final_career_directions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### AI Integration and Processing

<<<<<<< HEAD
#### 1. Manager Agent (CAMEL.AI)

**Purpose:** Coordinates and manages all specialized agents using CAMEL-AI's multi-agent framework

**CAMEL Implementation:**
```python
from camel.agents import ChatAgent
from camel.messages import BaseMessage
from camel.societies import RolePlaying
from camel.types import TaskType

class CareerPositioningManagerAgent(ChatAgent):
    def __init__(self):
        system_message = BaseMessage.make_assistant_message(
            role_name="Career Positioning Manager",
            content="You are a manager agent responsible for coordinating specialized career counseling agents to provide comprehensive career positioning assistance."
        )
        super().__init__(system_message)
        self.specialized_agents = self._initialize_specialized_agents()
        self.active_sessions = {}
    
    def _initialize_specialized_agents(self):
        return {
            'conversation': GeneralConversationAgent(),
            'profile_collector': ProfileCollectorAgent(),
            'assessment': AssessmentAgent(),
            'analysis': AnalysisAgent(),
            'recommendation': RecommendationAgent(),
            'memory': UserMemoryAgent()
        }
    
    def coordinate_request(self, user_message: str, user_id: str, context: dict) -> dict:
        # Analyze request and coordinate appropriate agents
        coordination_prompt = self._create_coordination_prompt(user_message, context)
        coordination_plan = self.step(coordination_prompt)
        
        # Execute coordination plan with specialized agents
        return self._execute_coordination_plan(coordination_plan, user_id, context)
    
    def orchestrate_workflow(self, workflow_type: str, user_id: str) -> dict:
        # Orchestrate multi-agent workflow using CAMEL societies
        if workflow_type == "career_positioning":
            return self._orchestrate_career_positioning_workflow(user_id)
    
    def _orchestrate_career_positioning_workflow(self, user_id: str):
        # Create role-playing society for career positioning
        task_prompt = "Complete comprehensive career positioning for user"
        
        # Coordinate agents in sequence with handoffs
        profile_result = self._coordinate_agent('profile_collector', user_id)
        assessment_result = self._coordinate_agent('assessment', user_id, profile_result)
        analysis_result = self._coordinate_agent('analysis', user_id, {
            'profile': profile_result,
            'assessment': assessment_result
        })
        recommendation_result = self._coordinate_agent('recommendation', user_id, analysis_result)
        
        return self._synthesize_final_result({
            'profile': profile_result,
            'assessment': assessment_result,
            'analysis': analysis_result,
            'recommendations': recommendation_result
        })
```

**Interface:**
```typescript
interface ManagerAgent {
  coordinateRequest(message: string, userId: string, context: ConversationContext): Promise<CoordinationResult>
  orchestrateWorkflow(workflowType: string, userId: string): Promise<WorkflowResult>
  delegateToAgent(agentType: AgentType, task: AgentTask): Promise<AgentResponse>
  synthesizeAgentResponses(responses: AgentResponse[]): Promise<UnifiedResponse>
  manageAgentHandoffs(fromAgent: AgentType, toAgent: AgentType, context: HandoffContext): Promise<void>
}
```

#### 2. General Conversation Agent (CAMEL.AI)

**Purpose:** Provides conversational assistance for general career-related queries

**CAMEL Implementation:**
```python
class GeneralConversationAgent(ChatAgent):
    def __init__(self):
        system_message = BaseMessage.make_assistant_message(
            role_name="Career Counselor",
            content="You are a friendly career counselor who provides helpful advice and guidance on career-related topics."
        )
        super().__init__(system_message)
    
    def generate_response_stream(self, user_message: str, context: dict):
        # Generate streaming conversational response
        response_prompt = self._create_conversation_prompt(user_message, context)
        for chunk in self.step_stream(response_prompt):
            yield chunk
```

**Interface:**
```typescript
interface GeneralConversationAgent {
  generateResponse(message: string, context: ConversationContext): AsyncGenerator<string>
  maintainContext(context: ConversationContext): void
  suggestWorkflows(userNeeds: string[]): WorkflowSuggestion[]
}
```

#### 3. User Memory Agent (CAMEL.AI)

**Purpose:** Maintains comprehensive user career memory and provides personalized context to other agents

**CAMEL Implementation:**
```python
from camel.memories import ChatMemory, VectorMemory
from camel.agents import ChatAgent

class UserMemoryAgent(ChatAgent):
    def __init__(self):
        system_message = BaseMessage.make_assistant_message(
            role_name="User Memory Manager",
            content="You are responsible for maintaining comprehensive user career profiles and providing personalized context to other agents."
        )
        super().__init__(system_message)
        self.chat_memory = ChatMemory()
        self.vector_memory = VectorMemory()
    
    def update_user_profile(self, user_id: str, profile_data: dict):
        # Update user's career profile in memory
        memory_record = self._create_memory_record(user_id, profile_data)
        self.chat_memory.write_records([memory_record])
        self.vector_memory.add(user_id, profile_data)
    
    def get_user_context(self, user_id: str) -> dict:
        # Retrieve comprehensive user context for other agents
        records = self.chat_memory.get_records(user_id)
        return self._synthesize_user_context(records)
    
    def update_job_preferences(self, user_id: str, preferences: dict):
        # Update user's job preferences and saved positions
        self._update_preference_memory(user_id, preferences)
    
    def track_progress(self, user_id: str, progress_data: dict):
        # Track user's interview progress, learning progress, etc.
        self._update_progress_memory(user_id, progress_data)
```

**Interface:**
```typescript
interface UserMemoryAgent {
  updateUserProfile(userId: string, profileData: UserProfileData): Promise<void>
  getUserContext(userId: string): Promise<UserContext>
  updateJobPreferences(userId: string, preferences: JobPreferences): Promise<void>
  trackProgress(userId: string, progressData: ProgressData): Promise<void>
  getSavedJobs(userId: string): Promise<SavedJob[]>
  getCareerInsights(userId: string): Promise<CareerInsights>
}
```

#### 4. Streaming Response Manager (CAMEL.AI)

**Purpose:** Manages real-time streaming of responses from all agents

**Implementation:**
```python
class StreamingResponseManager:
    def __init__(self):
        self.active_streams = {}
    
    def create_stream(self, session_id: str, agent_type: str):
        # Create new streaming session
        stream = StreamingSession(session_id, agent_type)
        self.active_streams[session_id] = stream
        return stream
    
    def stream_response(self, session_id: str, content: str, metadata: dict):
        # Stream content to frontend
        if session_id in self.active_streams:
            self.active_streams[session_id].send(content, metadata)
```

**Interface:**
```typescript
interface StreamingResponseManager {
  createStream(sessionId: string, agentType: string): StreamingSession
  streamResponse(sessionId: string, content: string, metadata: ResponseMetadata): void
  closeStream(sessionId: string): void
  getStreamStatus(sessionId: string): StreamStatus
}
```

#### 4. Multi-Agent Society Integration (CAMEL.AI)

**Purpose:** Implements CAMEL-AI's RolePlaying society for coordinated multi-agent interactions

**Implementation:**
```python
from camel.societies import RolePlaying
from camel.agents import ChatAgent
from camel.messages import BaseMessage
from camel.types import TaskType, RoleType

class CareerPositioningSociety:
    def __init__(self, manager_agent: CareerPositioningManagerAgent):
        self.manager_agent = manager_agent
        self.role_playing_sessions = {}
    
    def create_assessment_society(self, user_id: str, profile_context: dict):
        # Create role-playing society for assessment generation
        assistant_role_name = "Career Assessment Specialist"
        user_role_name = "Profile Analysis Assistant"
        
        task_prompt = f"""
        Generate personalized career assessment questions based on user profile:
        {profile_context}
        """
        
        assistant_inception_prompt = """
        You are a career assessment specialist who creates personalized questions
        to understand career preferences and personality traits.
        """
        
        user_inception_prompt = """
        You are assisting in creating the most relevant assessment questions
        based on the user's background and career goals.
        """
        
        role_play_session = RolePlaying(
            assistant_role_name=assistant_role_name,
            user_role_name=user_role_name,
            assistant_agent_kwargs=dict(
                system_message=BaseMessage.make_assistant_message(
                    role_name=assistant_role_name,
                    content=assistant_inception_prompt
                )
            ),
            user_agent_kwargs=dict(
                system_message=BaseMessage.make_assistant_message(
                    role_name=user_role_name,
                    content=user_inception_prompt
                )
            ),
            task_prompt=task_prompt,
            with_task_specify=True,
        )
        
        self.role_playing_sessions[f"{user_id}_assessment"] = role_play_session
        return role_play_session
    
    def create_analysis_society(self, user_id: str, combined_data: dict):
        # Create role-playing society for career analysis
        assistant_role_name = "Senior Career Analyst"
        user_role_name = "Data Synthesis Specialist"
        
        task_prompt = f"""
        Analyze comprehensive career data and generate insights:
        Profile: {combined_data.get('profile', {})}
        Assessment: {combined_data.get('assessment', {})}
        """
        
        # Similar implementation for analysis role-playing
        pass
    
    def execute_collaborative_analysis(self, session_key: str, max_iterations: int = 3):
        # Execute role-playing session for collaborative analysis
        if session_key in self.role_playing_sessions:
            session = self.role_playing_sessions[session_key]
            
            chat_turn_limit = max_iterations
            n = 0
            input_msg = session.init_chat()
            
            while n < chat_turn_limit:
                n += 1
                assistant_response, user_response = session.step(input_msg)
                
                if session.terminated:
                    break
                    
                input_msg = assistant_response
            
            return session.get_chat_history()
```

**Interface:**
```typescript
interface MultiAgentSociety {
  createAssessmentSociety(userId: string, profileContext: ProfileContext): Promise<RolePlayingSession>
  createAnalysisSociety(userId: string, combinedData: CombinedData): Promise<RolePlayingSession>
  executeCollaborativeAnalysis(sessionKey: string, maxIterations: number): Promise<ChatHistory>
  getActiveSessions(userId: string): Promise<ActiveSession[]>
=======
#### 1. Conversational AI Engine

**Purpose:** Handle natural language conversation and intent recognition

**Implementation:**
```typescript
// AI service for conversational responses
interface ConversationalAI {
  processMessage(message: string, context: ConversationContext): Promise<AIResponse>
  recognizeCareerIntent(message: string): Promise<CareerIntent>
  generateResponse(intent: Intent, context: Context): Promise<string>
  maintainContext(conversationId: string, newContext: Context): Promise<void>
}

// AI response with potential component rendering
interface AIResponse {
  message: string
  shouldRenderComponent?: boolean
  componentType?: ComponentType
  componentData?: any
  conversationContext: ConversationContext
>>>>>>> 609115d70e1da7887b8601161caf82b54b85e060
}
```

#### 2. Career Analysis Engine

<<<<<<< HEAD
**Purpose:** Collect and structure user profile information under Manager Agent coordination

**CAMEL Implementation:**
```python
from camel.agents import ChatAgent
from camel.messages import BaseMessage

class ProfileCollectorAgent(ChatAgent):
    def __init__(self, manager_agent=None):
        system_message = BaseMessage.make_assistant_message(
            role_name="Profile Collector Specialist",
            content="You are a specialized agent working under a Manager Agent to collect and structure user profile information for career positioning. You coordinate with the Manager Agent for all decisions and data sharing."
        )
        super().__init__(system_message)
        self.manager_agent = manager_agent
    
    def collect_and_validate_profile(self, form_data: dict, manager_context: dict) -> dict:
        # Validate profile data with Manager Agent oversight
        validation_prompt = self._create_validation_prompt(form_data, manager_context)
        response = self.step(validation_prompt)
        
        # Report back to Manager Agent
        validation_result = self._parse_validation_response(response)
        if self.manager_agent:
            self.manager_agent.receive_agent_update('profile_collector', validation_result)
        
        return validation_result
    
    def request_manager_guidance(self, issue: str, context: dict) -> dict:
        # Request guidance from Manager Agent for complex decisions
        if self.manager_agent:
            return self.manager_agent.provide_guidance('profile_collector', issue, context)
        return {}
    
    def collaborate_with_memory_agent(self, user_id: str, profile_data: dict):
        # Coordinate with Memory Agent through Manager Agent
        if self.manager_agent:
            self.manager_agent.coordinate_agent_collaboration(
                'profile_collector', 'memory', 
                {'action': 'store_profile', 'user_id': user_id, 'data': profile_data}
            )
```

**Interface:**
```typescript
interface ProfileCollectorAgent {
  collectBasicInfo(managerContext: ManagerContext): Promise<BasicProfileForm>
  validateProfileData(data: ProfileData, managerContext: ManagerContext): ValidationResult
  structureProfileData(rawData: FormData): StructuredProfile
  requestManagerGuidance(issue: string, context: any): Promise<ManagerGuidance>
  collaborateWithMemoryAgent(userId: string, profileData: ProfileData): Promise<void>
=======
**Purpose:** Process career data and generate insights

**Implementation:**
```typescript
// Career analysis service
interface CareerAnalysisEngine {
  analyzeProfile(profileData: ProfileData): Promise<ProfileAnalysis>
  generateAssessment(profileContext: ProfileData): Promise<AssessmentQuestions>
  scoreAssessment(responses: AssessmentResponse[]): Promise<AssessmentResults>
  synthesizeCareerProfile(profile: ProfileData, assessment: AssessmentResults): Promise<CareerProfile>
  generateJobRecommendations(careerProfile: CareerProfile): Promise<JobRecommendation[]>
  refineRecommendations(recommendations: JobRecommendation[], feedback: UserFeedback): Promise<JobRecommendation[]>
>>>>>>> 609115d70e1da7887b8601161caf82b54b85e060
}
```

#### 3. Dynamic Component System

<<<<<<< HEAD
**Purpose:** Generate and conduct personality/career assessments under Manager Agent coordination

**CAMEL Implementation:**
```python
class AssessmentAgent(ChatAgent):
    def __init__(self, manager_agent=None):
        system_message = BaseMessage.make_assistant_message(
            role_name="Assessment Specialist",
            content="You are a specialized psychological assessment expert working under a Manager Agent. You create personalized career and personality assessments while coordinating with other agents through the Manager Agent."
        )
        super().__init__(system_message)
        self.manager_agent = manager_agent
    
    def generate_personalized_questions(self, profile_context: dict, manager_guidance: dict) -> list:
        # Generate questions with Manager Agent coordination
        generation_prompt = self._create_question_generation_prompt(profile_context, manager_guidance)
        response = self.step(generation_prompt)
        questions = self._parse_questions(response)
        
        # Report to Manager Agent
        if self.manager_agent:
            self.manager_agent.receive_agent_update('assessment', {
                'action': 'questions_generated',
                'count': len(questions),
                'context': profile_context
            })
        
        return questions
    
    def score_and_interpret(self, responses: list, collaborative_context: dict) -> dict:
        # Score with input from other agents via Manager Agent
        scoring_prompt = self._create_scoring_prompt(responses, collaborative_context)
        response = self.step(scoring_prompt)
        results = self._parse_assessment_results(response)
        
        # Coordinate with Analysis Agent through Manager Agent
        if self.manager_agent:
            self.manager_agent.coordinate_agent_collaboration(
                'assessment', 'analysis',
                {'assessment_results': results, 'user_responses': responses}
            )
        
        return results
    
    def collaborate_in_role_playing(self, society_session, profile_data: dict):
        # Participate in CAMEL role-playing society for collaborative assessment
        return society_session.participate_as_specialist(self, profile_data)
```

**Interface:**
```typescript
interface AssessmentAgent {
  generateQuestions(profileContext: ProfileContext, managerGuidance: ManagerGuidance): Promise<Question[]>
  conductAssessment(questions: Question[], collaborativeContext: CollaborativeContext): Promise<AssessmentSession>
  scoreAssessment(responses: Response[], collaborativeContext: CollaborativeContext): AssessmentResults
  interpretResults(scores: AssessmentResults): PersonalityProfile
  collaborateInRolePlaying(societySession: RolePlayingSession, profileData: ProfileData): Promise<CollaborativeResult>
=======
**Purpose:** Render interactive components within chat messages

**Implementation:**
```typescript
// Component renderer for chat messages
interface ComponentRenderer {
  renderComponent(type: ComponentType, data: any, messageId: string): React.ReactElement
  handleComponentSubmission(componentId: string, data: any): Promise<void>
  updateComponentState(componentId: string, newState: any): void
>>>>>>> 609115d70e1da7887b8601161caf82b54b85e060
}

// Component types that can be rendered in chat
type ComponentType = 
  | 'profile-form'
  | 'assessment-quiz'
  | 'analysis-display'
  | 'job-recommendations'
  | 'career-directions'
  | 'loading-indicator'
  | 'error-display'
```

## Data Models

### Core Data Structures

```typescript
// Chat message structure
interface ChatMessage {
  id: string
  conversationId: string
  userId: string
  type: 'user' | 'assistant' | 'component'
  content: string
  componentType?: ComponentType
  componentData?: any
  timestamp: Date
  metadata?: MessageMetadata
}

// Conversation context
interface ConversationContext {
  conversationId: string
  userId: string
  currentPhase?: 'general' | 'career-positioning'
  careerSessionId?: string
  messageHistory: ChatMessage[]
  userProfile?: Partial<ProfileData>
  assessmentProgress?: AssessmentProgress
  analysisResults?: CareerAnalysis
}

// User profile data structure
interface ProfileData {
  basicInfo: {
    age: number
    gender: string
    currentLocation: string
    acceptableLocations: string[]
  }
  education: {
    level: EducationLevel
    school: string
    major: string
    graduationYear?: number
  }
  experience: {
    workExperience: WorkExperience[]
    internshipExperience: InternshipExperience[]
    totalYearsExperience: number
  }
  skills: {
    professionalSkills: string[]
    knowledgeAreas: string[]
    certifications?: string[]
  }
  preferences: {
    mbti?: string
    interests?: string[]
    careerGoals?: string[]
    workEnvironmentPreferences?: string[]
  }
}

// Assessment structure
interface AssessmentQuestions {
  id: string
  questions: Question[]
  estimatedTime: number
  categories: AssessmentCategory[]
}

interface Question {
  id: string
  text: string
  type: 'multiple-choice' | 'rating-scale' | 'ranking'
  options?: string[]
  category: string
  required: boolean
}

// Assessment results
interface AssessmentResults {
  sessionId: string
  responses: QuestionResponse[]
  scores: {
    personality: PersonalityScores
    careerPreferences: CareerPreferenceScores
    workStyle: WorkStyleScores
  }
  completionTime: number
  completionDate: Date
}

// Career analysis results
interface CareerAnalysis {
  personalityProfile: {
    traits: PersonalityTrait[]
    strengths: string[]
    developmentAreas: string[]
    workingStyle: WorkingStyleProfile
  }
  careerFit: {
    suitableRoles: string[]
    industries: string[]
    workEnvironments: string[]
    careerPaths: CareerPath[]
  }
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
}

// Job recommendations
interface JobRecommendation {
  id: string
  title: string
  company?: string
  industry: string
  location: string
  fitScore: number
  matchReasons: string[]
  requirements: JobRequirement[]
  salaryRange?: SalaryRange
  careerProgression: string[]
  userFeedback?: 'interested' | 'not-interested' | 'maybe'
}

// Career directions
interface CareerDirection {
  id: string
  title: string
  description: string
  suitabilityScore: number
  requiredSkills: string[]
  recommendedActions: ActionItem[]
  timeframe: string
  careerProgression: CareerStep[]
  resources: Resource[]
}
```

### Integration Layer

#### 1. Chat Service Integration
```typescript
// services/chat-service.ts
interface ChatService {
  sendMessage(conversationId: string, message: string): Promise<ChatMessage>
  getConversationHistory(conversationId: string): Promise<ChatMessage[]>
  createConversation(userId: string, title?: string): Promise<Conversation>
  streamResponse(message: string, context: ConversationContext): AsyncGenerator<string>
}

// AI service integration
class AIService {
  async processMessage(message: string, context: ConversationContext): Promise<AIResponse> {
    // Integrate with OpenAI or similar service
    const intent = await this.recognizeIntent(message, context)
    
    if (intent.type === 'career-positioning') {
      return await this.handleCareerIntent(intent, context)
    }
    
    return await this.generateConversationalResponse(message, context)
  }
  
  private async handleCareerIntent(intent: CareerIntent, context: ConversationContext): Promise<AIResponse> {
    // Determine which component to render based on career positioning phase
    const phase = this.determineCareerPhase(context)
    
    switch (phase) {
      case 'profile-collection':
        return {
          message: "I'd like to learn more about your background. Please fill out this profile form:",
          shouldRenderComponent: true,
          componentType: 'profile-form',
          componentData: await this.generateProfileForm(context)
        }
      case 'assessment':
        return {
          message: "Now let's do a quick assessment to understand your personality and preferences:",
          shouldRenderComponent: true,
          componentType: 'assessment-quiz',
          componentData: await this.generateAssessment(context)
        }
      // ... other phases
    }
  }
}
```

#### 2. Real-time Updates (Supabase Realtime)
```typescript
// hooks/useChatRealtime.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useChatRealtime(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage])
      })
      .on('presence', { event: 'sync' }, () => {
        // Handle typing indicators
      })
      .subscribe()
    
    return () => supabase.removeChannel(channel)
  }, [conversationId])
  
  return { messages, isTyping }
}

// hooks/useCareerSession.ts
export function useCareerSession(sessionId?: string) {
  const [session, setSession] = useState<CareerSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const updateSession = async (data: Partial<CareerSession>) => {
    if (!sessionId) return
    
    setIsLoading(true)
    try {
      const { data: updatedSession } = await supabase
        .from('career_sessions')
        .update(data)
        .eq('id', sessionId)
        .select()
        .single()
      
      setSession(updatedSession)
    } catch (error) {
      console.error('Error updating career session:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return { session, updateSession, isLoading }
}
```

#### 3. Component Integration System
```typescript
// components/chat/ComponentRenderer.tsx
interface ComponentRendererProps {
  message: ChatMessage
  onComponentSubmit: (componentId: string, data: any) => void
}

export function ComponentRenderer({ message, onComponentSubmit }: ComponentRendererProps) {
  const renderComponent = () => {
    switch (message.componentType) {
      case 'profile-form':
        return (
          <ProfileFormComponent
            data={message.componentData}
            onSubmit={(data) => onComponentSubmit(message.id, data)}
          />
        )
      case 'assessment-quiz':
        return (
          <AssessmentComponent
            questions={message.componentData.questions}
            onComplete={(results) => onComponentSubmit(message.id, results)}
          />
        )
      case 'analysis-display':
        return (
          <AnalysisComponent
            analysis={message.componentData}
            onInteraction={(interaction) => onComponentSubmit(message.id, interaction)}
          />
        )
      case 'job-recommendations':
        return (
          <RecommendationsComponent
            recommendations={message.componentData}
            onFeedback={(feedback) => onComponentSubmit(message.id, feedback)}
          />
        )
      case 'career-directions':
        return (
          <CareerDirectionsComponent
            directions={message.componentData}
            onSelection={(selection) => onComponentSubmit(message.id, selection)}
          />
        )
      default:
        return null
    }
  }
  
  return (
    <Box>
      <Text mb={4}>{message.content}</Text>
      {message.componentType && renderComponent()}
    </Box>
  )
}
```

## Error Handling

### Chat System Error Handling

1. **Message Delivery Failures:**
   - Implement message queuing with retry logic
   - Graceful degradation when real-time features are unavailable
   - Offline message storage and sync when connection is restored

2. **AI Service Failures:**
   - Fallback responses when AI service is unavailable
   - Timeout handling for AI response generation
   - Circuit breaker pattern for AI service calls

3. **Component Rendering Failures:**
   - Error boundaries for interactive components
   - Fallback UI when components fail to load
   - Data validation before component rendering

### Career Analysis Error Handling

```typescript
interface ErrorHandlingStrategy {
  handleAIServiceFailure(error: AIServiceError): Promise<FallbackResponse>
  handleComponentFailure(componentType: ComponentType, error: Error): React.ReactElement
  handleDataValidationFailure(data: any, schema: ValidationSchema): ValidationResult
  recoverCareerSession(sessionId: string): Promise<CareerSession>
}

// Error boundary for chat components
class ChatErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chat component error:', error, errorInfo)
    // Log to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <Box p={4} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
          <Text color="red.600">Something went wrong with this component.</Text>
          <Button size="sm" mt={2} onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </Button>
        </Box>
      )
    }
    
    return this.props.children
  }
}
```

## Testing Strategy

### Unit Testing
- Chat interface component testing
- Interactive component testing (forms, assessments, displays)
- AI service integration testing
- Data model validation testing

### Integration Testing
- End-to-end chat conversation flow testing
- Career positioning workflow testing
- Real-time message delivery testing
- Database operations and data consistency testing

### Component-Specific Testing

1. **Chat Interface Components:**
   - Message rendering and display
   - Input handling and validation
   - Real-time updates and synchronization
   - Mobile responsiveness and accessibility

2. **Interactive Career Components:**
   - Form validation and submission
   - Assessment question flow and progress tracking
   - Analysis display and interaction handling
   - Recommendation feedback and refinement

3. **AI Integration:**
   - Intent recognition accuracy
   - Response generation quality
   - Context management and memory
   - Error handling and fallback responses

### System Testing

```typescript
interface ChatSystemTestSuite {
  testConversationFlow(): Promise<TestResult>
  testComponentRendering(): Promise<TestResult>
  testRealTimeUpdates(): Promise<TestResult>
  testCareerWorkflow(): Promise<TestResult>
  testErrorRecovery(): Promise<TestResult>
  testPerformanceUnderLoad(): Promise<TestResult>
  testAccessibilityCompliance(): Promise<TestResult>
}

// Example test cases
describe('Career Positioning Chat Flow', () => {
  test('should recognize career intent and render profile form', async () => {
    const chatService = new ChatService()
    const response = await chatService.sendMessage(conversationId, "I need help with career positioning")
    
    expect(response.shouldRenderComponent).toBe(true)
    expect(response.componentType).toBe('profile-form')
  })
  
  test('should progress through complete career analysis workflow', async () => {
    // Test complete flow from profile collection to final recommendations
  })
  
  test('should handle component failures gracefully', async () => {
    // Test error boundaries and fallback UI
  })
})
```

## Performance Considerations

### Chat System Scalability
- Message virtualization for large conversation histories
- Efficient real-time connection management
- Horizontal scaling of chat API endpoints
- Database query optimization for message retrieval

### AI Service Optimization
- Response caching for similar queries
- Streaming responses for better perceived performance
- Request batching for career analysis operations
- Asynchronous processing for non-blocking operations

### Frontend Performance
- Code splitting for interactive components
- Lazy loading of career analysis features
- Optimistic UI updates for better responsiveness
- Memory management for long chat sessions

### Monitoring and Metrics

```typescript
interface PerformanceMetrics {
  chatMetrics: {
    messageDeliveryTime: number
    realTimeLatency: number
    componentRenderTime: number
    conversationLoadTime: number
  }
  aiMetrics: {
    responseGenerationTime: number
    intentRecognitionAccuracy: number
    contextProcessingTime: number
    streamingLatency: number
  }
  careerAnalysisMetrics: {
    profileProcessingTime: number
    assessmentGenerationTime: number
    analysisGenerationTime: number
    recommendationGenerationTime: number
  }
  userExperienceMetrics: {
    sessionDuration: number
    completionRate: number
    userSatisfactionScore: number
    errorRate: number
  }
}

// Performance monitoring service
class PerformanceMonitor {
  trackChatPerformance(metric: string, value: number, metadata?: any) {
    // Send metrics to monitoring service
  }
  
  trackUserJourney(userId: string, event: string, timestamp: Date) {
    // Track user interaction patterns
  }
  
  generatePerformanceReport(): Promise<PerformanceReport> {
    // Generate comprehensive performance analysis
  }
}
```