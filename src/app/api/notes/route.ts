import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')

    const notes = await prisma.note.findMany({
      where: topicId ? { topicId } : undefined,
      include: {
        topic: {
          include: {
            class: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const topicId = formData.get('topicId') as string
    const type = formData.get('type') as string
    const name = formData.get('name') as string
    const content = formData.get('content') as string | null
    const file = formData.get('file') as File | null

    if (!topicId || !type || !name) {
      return NextResponse.json(
        { error: 'topicId, type, and name are required' },
        { status: 400 }
      )
    }

    let filePath: string | null = null
    let extractedText: string | null = content

    if (file) {
      // Save uploaded file
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })

      const fileExt = path.extname(file.name)
      const fileName = `${uuidv4()}${fileExt}`
      filePath = `/uploads/${fileName}`

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(path.join(uploadDir, fileName), buffer)

      // For text files, read the content
      if (type === 'text') {
        extractedText = buffer.toString('utf-8')
      }
    }

    const note = await prisma.note.create({
      data: {
        name,
        type,
        content: type === 'youtube' ? content : null,
        filePath,
        extractedText,
        topicId,
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
