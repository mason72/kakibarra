import { NextResponse } from 'next/server'
import { database } from '@/lib/db'
import { generateFlashcards, generateQuizQuestions } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topicId, noteId, type = 'flashcards', numberOfCards = 10 } = body

    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 })
    }

    // Get the content to generate from
    let content = ''

    if (noteId) {
      // Generate from a specific note
      const note = await database.getNote(noteId)

      if (!note) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 })
      }

      content = note.extractedText || note.content || ''
    } else {
      // Generate from all notes in the topic
      const notes = await database.getNotes(topicId)

      content = notes
        .map(n => n.extractedText || n.content || '')
        .filter(Boolean)
        .join('\n\n---\n\n')
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: 'No content available to generate from. Please add some notes first.' },
        { status: 400 }
      )
    }

    if (type === 'quiz') {
      const questions = await generateQuizQuestions(content, numberOfCards)
      return NextResponse.json({ questions })
    }

    // Generate flashcards
    const generatedCards = await generateFlashcards(content, numberOfCards)

    // Save flashcards to database
    const savedCards = await Promise.all(
      generatedCards.map(card =>
        database.createFlashcard({
          question: card.question,
          answer: card.answer,
          hint: card.hint,
          difficulty: card.difficulty,
          topicId,
          noteId: noteId || undefined,
        })
      )
    )

    return NextResponse.json({ flashcards: savedCards })
  } catch (error) {
    console.error('Error generating content:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate content'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
