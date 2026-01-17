import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    const topics = await prisma.topic.findMany({
      where: classId ? { classId } : undefined,
      include: {
        class: true,
        _count: {
          select: {
            flashcards: true,
            notes: true,
          },
        },
      },
      orderBy: [{ classId: 'asc' }, { order: 'asc' }],
    })

    return NextResponse.json(topics)
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, classId } = body

    if (!name || !classId) {
      return NextResponse.json(
        { error: 'Name and classId are required' },
        { status: 400 }
      )
    }

    // Get the highest order number for this class
    const maxOrder = await prisma.topic.findFirst({
      where: { classId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const newTopic = await prisma.topic.create({
      data: {
        name,
        description: description || null,
        classId,
        order: (maxOrder?.order ?? -1) + 1,
      },
    })

    return NextResponse.json(newTopic, { status: 201 })
  } catch (error) {
    console.error('Error creating topic:', error)
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 })
  }
}
