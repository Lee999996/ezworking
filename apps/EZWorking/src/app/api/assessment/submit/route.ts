import { NextRequest, NextResponse } from 'next/server'
import { AssessmentService } from '@/services/assessment'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.session_id || !body.question_id || !body.answer_value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const answer = await AssessmentService.submitAnswer(
      body.session_id,
      body.question_id,
      body.answer_value
    )
    
    return NextResponse.json({ data: answer }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/assessment/submit:', error)
    return NextResponse.json(
      { error: 'Failed to submit answer' }, 
      { status: 500 }
    )
  }
} 