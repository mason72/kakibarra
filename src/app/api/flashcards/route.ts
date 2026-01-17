import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')
    const topicIds = searchParams.get('topicIds') // Comma-separated for multi-topic study

    let whereClause = {}

    if (topicIds) {
      whereClause = { topicId: { in: topicIds.split(',') } }
    } else if (topicId) {
      whereClause = { topicId }
    }

    const flashcards = await prisma.flashcard.findMany({
      where: whereClause,
      include: {
        topic: {
          include: {
            class: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(flashcards)
  } catch (error) {
    console.error('Error fetching flashcards:', error)
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { question, answer, hint, difficulty, topicId, noteId } = body

    if (!question || !answer || !topicId) {
      return NextResponse.json(
        { error: 'question, answer, and topicId are required' },
        { status: 400 }
      )
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        question,
        answer,
        hint: hint || null,
        difficulty: difficulty || 1,
        topicId,
        noteId: noteId || null,
      },
    })

    return NextResponse.json(flashcard, { status: 201 })
  } catch (error) {
    console.error('Error creating flashcard:', error)
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 })
  }
}
