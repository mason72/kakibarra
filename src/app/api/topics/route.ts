import { NextResponse } from 'next/server'
import { database } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    const topics = await database.getTopicsWithCounts(classId || undefined)
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

    const newTopic = await database.createTopic({
      name,
      description: description || undefined,
      classId,
    })

    return NextResponse.json(newTopic, { status: 201 })
  } catch (error) {
    console.error('Error creating topic:', error)
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 })
  }
}
