import { NextResponse } from 'next/server'
import { database } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { question, answer, hint, difficulty, timesStudied, timesCorrect, lastStudied } = body

    const updatedFlashcard = await database.updateFlashcard(params.id, {
      ...(question && { question }),
      ...(answer && { answer }),
      ...(hint !== undefined && { hint }),
      ...(difficulty !== undefined && { difficulty }),
      ...(timesStudied !== undefined && { timesStudied }),
      ...(timesCorrect !== undefined && { timesCorrect }),
      ...(lastStudied !== undefined && { lastStudied }),
    })

    if (!updatedFlashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 })
    }

    return NextResponse.json(updatedFlashcard)
  } catch (error) {
    console.error('Error updating flashcard:', error)
    return NextResponse.json({ error: 'Failed to update flashcard' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await database.deleteFlashcard(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting flashcard:', error)
    return NextResponse.json({ error: 'Failed to delete flashcard' }, { status: 500 })
  }
}
