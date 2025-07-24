# Job Recommendations Component

## Overview

The Job Recommendations component displays personalized job recommendations based on user profile and assessment results. It allows users to provide feedback on job positions and refine recommendations accordingly.

## Features

### Core Functionality
- **Job Display**: Shows job recommendations with titles, companies, locations, and fit scores
- **Preference Selection**: Users can mark jobs as "interested", "not interested", or "maybe"
- **Detailed View**: Expandable cards showing full job details, requirements, and career progression
- **Feedback Collection**: Tracks user preferences and provides feedback statistics
- **Recommendation Refinement**: Allows users to request improved recommendations based on their feedback

### User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Interactive Cards**: Expandable job cards with detailed information
- **Visual Feedback**: Color-coded fit scores and feedback indicators
- **Progress Tracking**: Shows feedback statistics and completion status

## Component Structure

### Main Component: `JobRecommendationsComponent`
```typescript
interface JobRecommendationsProps {
  recommendationsData: JobRecommendationsData
  onFeedback?: (jobId: string, feedback: 'interested' | 'not-interested' | 'maybe') => void
  onRefineRecommendations?: () => void
  onContinue?: () => void
}
```

### Job Card: `JobRecommendationCard`
- Displays individual job information
- Handles expansion/collapse of details
- Manages feedback buttons and visual states
- Shows match reasons, requirements, and career progression

## Data Structure

### JobRecommendation Interface
```typescript
interface JobRecommendation {
  id: string
  title: string
  company: string
  industry: string
  location: string
  fitScore: number
  matchReasons: string[]
  requirements: string[]
  salaryRange?: {
    min: number
    max: number
    currency: string
  }
  description: string
  careerProgression: string[]
  userFeedback?: 'interested' | 'not-interested' | 'maybe'
}
```

### JobRecommendationsData Interface
```typescript
interface JobRecommendationsData {
  recommendations: JobRecommendation[]
  totalCount: number
  refinementSuggestions: string[]
}
```

## Usage Example

```tsx
import { JobRecommendationsComponent } from './job-recommendations'
import { mockJobRecommendations } from '../../utils/mock-job-recommendations'

function MyComponent() {
  const [recommendations, setRecommendations] = useState(mockJobRecommendations)
  
  const handleFeedback = (jobId: string, feedback: string) => {
    // Handle user feedback
    console.log(`User feedback for ${jobId}: ${feedback}`)
  }
  
  const handleRefine = () => {
    // Refine recommendations based on feedback
    console.log('Refining recommendations...')
  }
  
  const handleContinue = () => {
    // Continue to next step
    console.log('Continuing to career planning...')
  }
  
  return (
    <JobRecommendationsComponent
      recommendationsData={recommendations}
      onFeedback={handleFeedback}
      onRefineRecommendations={handleRefine}
      onContinue={handleContinue}
    />
  )
}
```

## Key Features Implementation

### 1. Job Card Display
- **Fit Score**: Visual progress bar and color-coded badge
- **Company Info**: Company name, location, and industry
- **Salary Range**: Formatted salary information
- **Match Reasons**: Bulleted list of why the job matches the user

### 2. Interactive Feedback
- **Three-State Feedback**: Interested (👍), Maybe (😐), Not Interested (👎)
- **Visual Indicators**: Color-coded borders and icons for feedback state
- **Feedback Statistics**: Summary of user preferences across all jobs

### 3. Expandable Details
- **Requirements**: Job requirements displayed as tags
- **Career Progression**: Potential career paths from this position
- **Full Description**: Complete job description and responsibilities

### 4. Recommendation Refinement
- **Feedback Analysis**: Tracks user preferences to improve recommendations
- **Refinement Suggestions**: Provides actionable suggestions for improvement
- **Algorithm Updates**: Simulates ML-based recommendation refinement

## Styling and Theming

### Color Schemes
- **Fit Scores**: Green (85+), Blue (75-84), Yellow (65-74), Orange (<65)
- **Feedback States**: Green (interested), Yellow (maybe), Red (not interested)
- **Interactive Elements**: Blue accent color for buttons and links

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Flexible Layout**: Adapts to different screen sizes
- **Touch-Friendly**: Large touch targets for mobile interaction

## Integration Points

### Chat Interface Integration
- Designed to work within the chat message card system
- Follows the same styling patterns as other career positioning components
- Provides callbacks for chat flow continuation

### Data Integration
- Uses mock data structure that can be replaced with real API calls
- Supports both static and dynamic recommendation updates
- Handles user feedback persistence

## Testing

### Test Page
A dedicated test page is available at `/test-job-recommendations` that demonstrates:
- All component features and interactions
- Feedback collection and refinement
- Responsive design across different screen sizes
- Integration with the broader career positioning system

### Key Test Scenarios
1. **Job Display**: Verify all job information is displayed correctly
2. **Feedback Collection**: Test all three feedback states
3. **Detail Expansion**: Ensure job details expand/collapse properly
4. **Recommendation Refinement**: Test the refinement workflow
5. **Responsive Design**: Test on mobile and desktop devices

## Future Enhancements

### Planned Features
- **Job Bookmarking**: Save jobs for later review
- **Application Tracking**: Track job application status
- **Salary Negotiation**: Tools for salary research and negotiation
- **Interview Preparation**: Resources for interview preparation

### Technical Improvements
- **Real-time Updates**: Live recommendation updates based on user behavior
- **Advanced Filtering**: Filter by location, salary, company size, etc.
- **Personalization**: More sophisticated ML-based recommendations
- **Integration**: Connect with job boards and application systems

## Requirements Mapping

This component fulfills the following requirements:

### Requirement 5.1
✅ Displays at least 5 job positions with titles, descriptions, fit scores, and reasoning

### Requirement 5.2
✅ Allows users to mark positions as "interested", "not interested", or "maybe"

### Requirement 5.3
✅ Provides recommendation refinement and feedback collection capabilities

The component is designed to integrate seamlessly with the chat interface and provides a comprehensive job recommendation experience that meets all specified requirements.