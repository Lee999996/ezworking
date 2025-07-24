import { NextRequest, NextResponse } from 'next/server'

// This file is deprecated and will be removed in a future update.
// Please use the new assessment session-based endpoints.

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'This endpoint is deprecated.' }, { status: 410 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'This endpoint is deprecated.' }, { status: 410 })
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: 'This endpoint is deprecated.' }, { status: 410 })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'This endpoint is deprecated.' }, { status: 410 })
} 