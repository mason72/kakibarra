import { NextResponse } from 'next/server'
import { database } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const sessions = await database.getStudySessions(limit)

    // Parse topicIds back to arrays
    const sessionsWithParsedTopics = sessions.map(session => ({
      ...session,
      topicIds: JSON.parse(session.topicIds),
    }))

    return NextResponse.json(sessionsWithParsedTopics)
  } catch (error) {
    console.error('Error fetching study sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch study sessions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topicIds, totalCards, correctAnswers, duration } = body

    if (!topicIds || !Array.isArray(topicIds) || topicIds.length === 0) {
      return NextResponse.json(
        { error: 'topicIds array is required' },
        { status: 400 }
      )
    }

    const session = await database.createStudySession({
      topicIds,
      totalCards: totalCards || 0,
      correctAnswers: correctAnswers || 0,
      duration: duration || 0,
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Error creating study session:', error)
    return NextResponse.json({ error: 'Failed to create study session' }, { status: 500 })
  }
}
