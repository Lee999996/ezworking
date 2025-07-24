# Requirements Document

## Introduction

The Career Positioning feature is the core functionality of EzWorking that addresses the primary pain point: "Job seekers don't know what positions they are suitable for." Through AI-driven multi-dimensional career assessment and intelligent analysis, this feature helps job seekers clarify their career positioning and find the most suitable job directions.

## Requirements

### Requirement 1

**User Story:** As a job seeker, I want to provide my personal and professional information through a structured form, so that the system can understand my background and preferences.

#### Acceptance Criteria

1. WHEN a user accesses the career positioning feature THEN the system SHALL display a comprehensive information collection form
2. WHEN a user fills out the form THEN the system SHALL collect the following required information: age, gender, current location, acceptable locations, education level, school, major, professional skills, knowledge areas, work/internship experience
3. WHEN a user fills out the form THEN the system SHALL optionally collect: MBTI personality type and interests/hobbies
4. WHEN a user submits the form THEN the system SHALL validate all required fields are completed
5. WHEN form validation passes THEN the system SHALL save the structured data to the user_profile table
6. WHEN user profile data is saved THEN the system SHALL maintain this information in the AI agent's memory for future reference

### Requirement 2

**User Story:** As a job seeker, I want to take an intelligent assessment test, so that the system can better understand my personality and career preferences.

#### Acceptance Criteria

1. WHEN a user completes the information form THEN the system SHALL generate 15-20 assessment questions
2. WHEN generating questions THEN the system SHALL include both personality assessment and career personality assessment questions
3. WHEN a user is taking the assessment THEN the system SHALL present questions one at a time with clear answer options
4. WHEN a user completes all assessment questions THEN the system SHALL calculate and store the assessment results
5. WHEN assessment is completed THEN the system SHALL proceed to profile analysis phase

### Requirement 3

**User Story:** As a job seeker, I want to receive an AI-generated personality and career profile analysis, so that I can understand my strengths and career tendencies.

#### Acceptance Criteria

1. WHEN assessment results are available THEN the system SHALL generate a comprehensive profile analysis using AI
2. WHEN generating profile analysis THEN the system SHALL consider both form data and assessment results
3. WHEN profile analysis is complete THEN the system SHALL maintain this analysis in the AI agent's memory
4. WHEN profile analysis is generated THEN the system SHALL present the analysis to the user in a clear, understandable format
5. WHEN user views their profile analysis THEN the system SHALL highlight key personality traits, strengths, and career tendencies

### Requirement 4

**User Story:** As a job seeker, I want to receive personalized job position recommendations based on my profile, so that I can explore suitable career options.

#### Acceptance Criteria

1. WHEN profile analysis is complete THEN the system SHALL generate initial job position recommendations
2. WHEN generating recommendations THEN the system SHALL base suggestions on both form data and profile analysis
3. WHEN presenting recommendations THEN the system SHALL show at least 5 different job positions
4. WHEN user reviews recommendations THEN the system SHALL allow them to express preferences (like/dislike) for each position
5. WHEN user provides feedback on recommendations THEN the system SHALL refine and provide additional suggestions
6. WHEN user shows interest in positions THEN the system SHALL continue recommending until user selects at least 1 position
7. WHEN user selects 1 position THEN the system SHALL recommend 2 additional related positions but ensure minimum 5 total recommendations

### Requirement 5

**User Story:** As a user, I want to interact with a Manager Agent that coordinates multiple specialized agents to provide comprehensive career assistance, so that I receive expert guidance through intelligent multi-agent collaboration.

#### Acceptance Criteria

1. WHEN a user sends any message THEN the system SHALL use a Manager Agent to analyze user intent and coordinate appropriate specialized agents
2. WHEN user intent matches career positioning workflow THEN the Manager Agent SHALL orchestrate collaboration between Profile Collector, Assessment, Analysis, and Recommendation agents
3. WHEN user intent is general inquiry THEN the Manager Agent SHALL delegate to the Conversation Agent while maintaining oversight
4. WHEN user is in a structured workflow THEN the Manager Agent SHALL coordinate agent handoffs and maintain workflow continuity
5. WHEN agents need to collaborate THEN the Manager Agent SHALL facilitate inter-agent communication and data sharing
6. WHEN providing any response THEN the Manager Agent SHALL coordinate streaming output from appropriate agents for real-time user feedback
7. WHEN user asks workflow-related questions THEN the Manager Agent SHALL explain available processes and coordinate agent responses

### Requirement 6

**User Story:** As a user, I want to experience seamless transitions between structured workflows and conversational assistance, so that I can get help in the most natural and efficient way.

#### Acceptance Criteria

1. WHEN user is in career positioning workflow THEN they SHALL be able to ask general questions without losing workflow progress
2. WHEN user asks questions during workflow THEN the system SHALL provide contextual answers while maintaining workflow state
3. WHEN user wants to pause or resume workflow THEN the system SHALL save progress and allow seamless continuation
4. WHEN user completes structured workflow THEN the system SHALL transition to conversational mode while retaining workflow results
5. WHEN user requests workflow restart or modification THEN the system SHALL accommodate while preserving relevant previous data
6. WHEN providing any assistance THEN all responses SHALL be delivered via streaming for real-time interaction

### Requirement 7

**User Story:** As a user, I want AI responses to be delivered in appropriate formats combining conversational and visual elements, so that I can interact naturally while viewing structured information clearly.

#### Acceptance Criteria

1. WHEN any agent generates conversational responses THEN it SHALL stream the output token by token in real-time
2. WHEN system provides structured data like assessments or job recommendations THEN it SHALL render them as interactive cards or visual components
3. WHEN system streams assessment questions THEN it SHALL display them as interactive quiz cards with answer options
4. WHEN system provides job recommendations THEN it SHALL render them as detailed job cards with visual elements
5. WHEN system shows analysis results THEN it SHALL combine streaming explanations with visual charts and infographics
6. WHEN user interacts with cards THEN the system SHALL provide conversational feedback about their selections
7. WHEN streaming is interrupted THEN the system SHALL gracefully handle reconnection and resume streaming

### Requirement 8

**User Story:** As a job seeker, I want the system to maintain a comprehensive memory of my career journey and preferences, so that I receive personalized assistance based on my complete profile and history.

#### Acceptance Criteria

1. WHEN I interact with the system THEN it SHALL maintain persistent memory of my personal information, career preferences, and job search progress
2. WHEN I complete assessments or workflows THEN the system SHALL update my career profile memory with new insights and preferences
3. WHEN I save job positions or express preferences THEN the system SHALL remember my interests and use them for future recommendations
4. WHEN I return to the system THEN it SHALL recall my previous interactions, progress, and preferences to provide continualized assistance
5. WHEN agents need user information THEN they SHALL access the centralized user memory for consistent and up-to-date data
6. WHEN my information changes THEN the system SHALL update the memory and notify relevant agents of the changes
7. WHEN I request my data THEN the system SHALL provide a comprehensive view of all stored career-related information

### Requirement 9

**User Story:** As a system administrator, I want the multi-agent system to be coordinated by a Manager Agent that ensures consistency and proper collaboration protocols, so that users receive coherent and reliable assistance.

#### Acceptance Criteria

1. WHEN Manager Agent processes user input THEN it SHALL accurately analyze requirements and delegate to appropriate specialized agents
2. WHEN agents communicate THEN the Manager Agent SHALL facilitate message passing and ensure protocols are followed
3. WHEN user switches between workflows and general chat THEN the Manager Agent SHALL maintain context consistency and coordinate smooth transitions
4. WHEN multiple agents need to collaborate THEN the Manager Agent SHALL orchestrate their interactions to prevent conflicts and ensure coherent responses
5. WHEN system encounters errors THEN the Manager Agent SHALL coordinate recovery efforts and maintain user session continuity
6. WHEN user session ends THEN the Manager Agent SHALL ensure all agents persist their knowledge to shared storage for future sessions