import { NextResponse } from 'next/server'
import { database } from '@/lib/db'

export async function GET() {
  try {
    const classes = await database.getClassesWithTopics()
    return NextResponse.json(classes)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, color, emoji } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const newClass = await database.createClass({
      name,
      description: description || undefined,
      color: color || undefined,
      emoji: emoji || undefined,
    })

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
}
