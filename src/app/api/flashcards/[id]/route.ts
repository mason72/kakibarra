import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { question, answer, hint, difficulty, timesStudied, timesCorrect, lastStudied } = body

    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: params.id },
      data: {
        ...(question && { question }),
        ...(answer && { answer }),
        ...(hint !== undefined && { hint }),
        ...(difficulty !== undefined && { difficulty }),
        ...(timesStudied !== undefined && { timesStudied }),
        ...(timesCorrect !== undefined && { timesCorrect }),
        ...(lastStudied !== undefined && { lastStudied: new Date(lastStudied) }),
      },
    })

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
    await prisma.flashcard.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting flashcard:', error)
    return NextResponse.json({ error: 'Failed to delete flashcard' }, { status: 500 })
  }
}
