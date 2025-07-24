# Assessment Quiz Component

## Overview

The Assessment Quiz component provides an interactive assessment experience within the chat interface for career positioning. It supports multiple question types, progress tracking, and seamless integration with the existing assessment database structure.

## Features

### ✅ Implemented Features

1. **Interactive Assessment Interface**
   - Clean, card-based UI using ChatMessageCard component
   - Progress indicator showing completion percentage
   - Question counter (e.g., "问题 1 / 12")

2. **Multiple Question Types Support**
   - Single choice (radio buttons)
   - Multiple choice (checkboxes)
   - Rating scale (slider with customizable range)

3. **Progress Tracking**
   - Visual progress bar
   - Current question navigation
   - Session progress updates in database

4. **Question Navigation**
   - Previous/Next buttons
   - Validation for required questions
   - Completion handling

5. **Database Integration**
   - Uses existing AssessmentService
   - Stores answers in real-time
   - Session management (start/complete)
   - Fallback to mock data for development

6. **Error Handling**
   - Loading states
   - Error messages
   - Graceful fallbacks

7. **Chat Integration**
   - Seamlessly integrates with chat interface
   - Completion callbacks
   - Component data passing

## Usage

### Basic Usage

```tsx
import { AssessmentQuiz } from './assessment-quiz'

<AssessmentQuiz
  templateId="career-interest-template"
  userId="user-123"
  onComplete={(sessionId, results) => {
    console.log('Assessment completed:', sessionId, results)
  }}
  onCancel={() => {
    console.log('Assessment cancelled')
  }}
/>
```

### Integration with Chat Interface

The component is automatically rendered when the chat interface receives a message with `componentType: 'assessment-quiz'`:

```tsx
// In use-chat.ts
addComponentMessage(
  '让我们通过一个简短的测评来了解您的职业倾向和个性特点。',
  'assessment-quiz',
  {
    templateId: 'career-interest-template',
    questionCount: 15,
    estimatedTime: 10
  }
)
```

## Question Types

### Single Choice
```json
{
  "type": "single_choice",
  "options": {
    "choices": [
      { "value": "team", "label": "团队协作，与同事密切合作" },
      { "value": "independent", "label": "独立工作，自主安排时间" }
    ]
  }
}
```

### Multiple Choice
```json
{
  "type": "multiple_choice",
  "options": {
    "choices": [
      { "value": "programming", "label": "编程开发" },
      { "value": "design", "label": "设计创意" }
    ]
  }
}
```

### Rating Scale
```json
{
  "type": "rating_scale",
  "options": {
    "min": 1,
    "max": 5,
    "step": 1,
    "minLabel": "完全不感兴趣",
    "maxLabel": "非常感兴趣"
  }
}
```

## Database Schema

The component works with the existing database structure:

- `assessment_templates` - Assessment template definitions
- `assessment_questions` - Individual questions for each template
- `assessment_sessions` - User assessment sessions
- `assessment_answers` - Individual question answers

## Mock Data

For development purposes, the component includes comprehensive mock data:

- 2 assessment templates (career interest & personality)
- 7 sample questions with different types
- Automatic fallback when database is unavailable

## Component States

1. **Loading** - Initial data fetching
2. **Error** - When initialization fails
3. **Active** - Normal question answering
4. **Completed** - Assessment finished successfully

## Validation

- Required questions must be answered before proceeding
- Toast notifications for validation errors
- Progress tracking prevents skipping questions

## Integration Points

### Requirements Satisfied

- **3.1**: Interactive assessment component ✅
- **3.2**: Progress tracking and navigation ✅  
- **3.3**: Completion handling and results storage ✅

### Database Tables Used

- `assessment_templates` - Template metadata
- `assessment_questions` - Question definitions
- `assessment_sessions` - Session tracking
- `assessment_answers` - Answer storage

## Testing

Basic test coverage includes:
- Component rendering
- Loading states
- Error handling
- User interactions
- Answer submission

## Future Enhancements

Potential improvements for future iterations:
- Question branching logic
- Time tracking per question
- Answer confidence levels
- Resume incomplete assessments
- Multiple assessment types in one session