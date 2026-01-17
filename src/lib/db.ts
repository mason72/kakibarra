import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Types
export interface Class {
  id: string
  name: string
  description: string | null
  color: string
  emoji: string
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: string
  name: string
  description: string | null
  order: number
  classId: string
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  name: string
  type: string
  content: string | null
  filePath: string | null
  extractedText: string | null
  topicId: string
  createdAt: string
  updatedAt: string
}

export interface Flashcard {
  id: string
  question: string
  answer: string
  hint: string | null
  difficulty: number
  timesStudied: number
  timesCorrect: number
  lastStudied: string | null
  topicId: string
  noteId: string | null
  createdAt: string
  updatedAt: string
}

export interface StudySession {
  id: string
  topicIds: string
  totalCards: number
  correctAnswers: number
  duration: number
  completedAt: string
}

interface DbData {
  classes: Class[]
  topics: Topic[]
  notes: Note[]
  flashcards: Flashcard[]
  studySessions: StudySession[]
}

const defaultData: DbData = {
  classes: [],
  topics: [],
  notes: [],
  flashcards: [],
  studySessions: [],
}

// Database file path
const dbPath = path.join(process.cwd(), 'data', 'db.json')

// Create adapter and database
const adapter = new JSONFile<DbData>(dbPath)
const db = new Low<DbData>(adapter, defaultData)

// Initialize database
async function initDb() {
  await db.read()
  db.data ||= defaultData
  await db.write()
}

// Ensure db is initialized
let initPromise: Promise<void> | null = null
async function getDb() {
  if (!initPromise) {
    const fs = await import('fs/promises')
    await fs.mkdir(path.dirname(dbPath), { recursive: true })
    initPromise = initDb()
  }
  await initPromise
  return db
}

// Helper to create timestamps
const now = () => new Date().toISOString()

// Database operations
export const database = {
  // Classes
  async getClasses() {
    const db = await getDb()
    return db.data.classes.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async getClass(id: string) {
    const db = await getDb()
    return db.data.classes.find(c => c.id === id) || null
  },

  async createClass(data: { name: string; description?: string; color?: string; emoji?: string }) {
    const db = await getDb()
    const newClass: Class = {
      id: uuidv4(),
      name: data.name,
      description: data.description || null,
      color: data.color || '#d4873f',
      emoji: data.emoji || '📚',
      createdAt: now(),
      updatedAt: now(),
    }
    db.data.classes.push(newClass)
    await db.write()
    return newClass
  },

  async updateClass(id: string, data: Partial<Class>) {
    const db = await getDb()
    const index = db.data.classes.findIndex(c => c.id === id)
    if (index === -1) return null
    db.data.classes[index] = { ...db.data.classes[index], ...data, updatedAt: now() }
    await db.write()
    return db.data.classes[index]
  },

  async deleteClass(id: string) {
    const db = await getDb()
    // Delete related data
    const topicIds = db.data.topics.filter(t => t.classId === id).map(t => t.id)
    db.data.flashcards = db.data.flashcards.filter(f => !topicIds.includes(f.topicId))
    db.data.notes = db.data.notes.filter(n => !topicIds.includes(n.topicId))
    db.data.topics = db.data.topics.filter(t => t.classId !== id)
    db.data.classes = db.data.classes.filter(c => c.id !== id)
    await db.write()
    return true
  },

  // Topics
  async getTopics(classId?: string) {
    const db = await getDb()
    let topics = db.data.topics
    if (classId) {
      topics = topics.filter(t => t.classId === classId)
    }
    return topics.sort((a, b) => a.order - b.order)
  },

  async getTopic(id: string) {
    const db = await getDb()
    return db.data.topics.find(t => t.id === id) || null
  },

  async createTopic(data: { name: string; description?: string; classId: string }) {
    const db = await getDb()
    const maxOrder = Math.max(0, ...db.data.topics.filter(t => t.classId === data.classId).map(t => t.order))
    const newTopic: Topic = {
      id: uuidv4(),
      name: data.name,
      description: data.description || null,
      classId: data.classId,
      order: maxOrder + 1,
      createdAt: now(),
      updatedAt: now(),
    }
    db.data.topics.push(newTopic)
    await db.write()
    return newTopic
  },

  async updateTopic(id: string, data: Partial<Topic>) {
    const db = await getDb()
    const index = db.data.topics.findIndex(t => t.id === id)
    if (index === -1) return null
    db.data.topics[index] = { ...db.data.topics[index], ...data, updatedAt: now() }
    await db.write()
    return db.data.topics[index]
  },

  async deleteTopic(id: string) {
    const db = await getDb()
    db.data.flashcards = db.data.flashcards.filter(f => f.topicId !== id)
    db.data.notes = db.data.notes.filter(n => n.topicId !== id)
    db.data.topics = db.data.topics.filter(t => t.id !== id)
    await db.write()
    return true
  },

  // Notes
  async getNotes(topicId?: string) {
    const db = await getDb()
    let notes = db.data.notes
    if (topicId) {
      notes = notes.filter(n => n.topicId === topicId)
    }
    return notes.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async getNote(id: string) {
    const db = await getDb()
    return db.data.notes.find(n => n.id === id) || null
  },

  async createNote(data: { name: string; type: string; content?: string; filePath?: string; extractedText?: string; topicId: string }) {
    const db = await getDb()
    const newNote: Note = {
      id: uuidv4(),
      name: data.name,
      type: data.type,
      content: data.content || null,
      filePath: data.filePath || null,
      extractedText: data.extractedText || null,
      topicId: data.topicId,
      createdAt: now(),
      updatedAt: now(),
    }
    db.data.notes.push(newNote)
    await db.write()
    return newNote
  },

  async updateNote(id: string, data: Partial<Note>) {
    const db = await getDb()
    const index = db.data.notes.findIndex(n => n.id === id)
    if (index === -1) return null
    db.data.notes[index] = { ...db.data.notes[index], ...data, updatedAt: now() }
    await db.write()
    return db.data.notes[index]
  },

  async deleteNote(id: string) {
    const db = await getDb()
    db.data.flashcards = db.data.flashcards.filter(f => f.noteId !== id)
    db.data.notes = db.data.notes.filter(n => n.id !== id)
    await db.write()
    return true
  },

  // Flashcards
  async getFlashcards(topicId?: string, topicIds?: string[]) {
    const db = await getDb()
    let flashcards = db.data.flashcards
    if (topicIds && topicIds.length > 0) {
      flashcards = flashcards.filter(f => topicIds.includes(f.topicId))
    } else if (topicId) {
      flashcards = flashcards.filter(f => f.topicId === topicId)
    }
    return flashcards.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async getFlashcard(id: string) {
    const db = await getDb()
    return db.data.flashcards.find(f => f.id === id) || null
  },

  async createFlashcard(data: { question: string; answer: string; hint?: string; difficulty?: number; topicId: string; noteId?: string }) {
    const db = await getDb()
    const newFlashcard: Flashcard = {
      id: uuidv4(),
      question: data.question,
      answer: data.answer,
      hint: data.hint || null,
      difficulty: data.difficulty || 1,
      timesStudied: 0,
      timesCorrect: 0,
      lastStudied: null,
      topicId: data.topicId,
      noteId: data.noteId || null,
      createdAt: now(),
      updatedAt: now(),
    }
    db.data.flashcards.push(newFlashcard)
    await db.write()
    return newFlashcard
  },

  async updateFlashcard(id: string, data: Partial<Flashcard>) {
    const db = await getDb()
    const index = db.data.flashcards.findIndex(f => f.id === id)
    if (index === -1) return null

    // Handle incrementing study counts
    const current = db.data.flashcards[index]
    if (data.timesStudied !== undefined) {
      data.timesStudied = current.timesStudied + data.timesStudied
    }
    if (data.timesCorrect !== undefined) {
      data.timesCorrect = current.timesCorrect + data.timesCorrect
    }

    db.data.flashcards[index] = { ...current, ...data, updatedAt: now() }
    await db.write()
    return db.data.flashcards[index]
  },

  async deleteFlashcard(id: string) {
    const db = await getDb()
    db.data.flashcards = db.data.flashcards.filter(f => f.id !== id)
    await db.write()
    return true
  },

  // Study Sessions
  async getStudySessions(limit = 10) {
    const db = await getDb()
    return db.data.studySessions
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, limit)
  },

  async createStudySession(data: { topicIds: string[]; totalCards: number; correctAnswers: number; duration: number }) {
    const db = await getDb()
    const newSession: StudySession = {
      id: uuidv4(),
      topicIds: JSON.stringify(data.topicIds),
      totalCards: data.totalCards,
      correctAnswers: data.correctAnswers,
      duration: data.duration,
      completedAt: now(),
    }
    db.data.studySessions.push(newSession)
    await db.write()
    return newSession
  },

  // Helpers for getting related data
  async getClassWithTopics(id: string) {
    const db = await getDb()
    const classData = db.data.classes.find(c => c.id === id)
    if (!classData) return null

    const topics = db.data.topics.filter(t => t.classId === id).sort((a, b) => a.order - b.order)
    const topicsWithCounts = topics.map(topic => ({
      ...topic,
      notes: db.data.notes.filter(n => n.topicId === topic.id),
      flashcards: db.data.flashcards.filter(f => f.topicId === topic.id),
      _count: {
        notes: db.data.notes.filter(n => n.topicId === topic.id).length,
        flashcards: db.data.flashcards.filter(f => f.topicId === topic.id).length,
      },
    }))

    return { ...classData, topics: topicsWithCounts }
  },

  async getClassesWithTopics() {
    const db = await getDb()
    return db.data.classes.map(classData => {
      const topics = db.data.topics.filter(t => t.classId === classData.id).sort((a, b) => a.order - b.order)
      const topicsWithCounts = topics.map(topic => ({
        ...topic,
        _count: {
          notes: db.data.notes.filter(n => n.topicId === topic.id).length,
          flashcards: db.data.flashcards.filter(f => f.topicId === topic.id).length,
        },
      }))
      return { ...classData, topics: topicsWithCounts }
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getTopicsWithCounts(classId?: string) {
    const db = await getDb()
    let topics = db.data.topics
    if (classId) {
      topics = topics.filter(t => t.classId === classId)
    }
    return topics.map(topic => {
      const classData = db.data.classes.find(c => c.id === topic.classId)
      return {
        ...topic,
        class: classData,
        _count: {
          notes: db.data.notes.filter(n => n.topicId === topic.id).length,
          flashcards: db.data.flashcards.filter(f => f.topicId === topic.id).length,
        },
      }
    }).sort((a, b) => a.order - b.order)
  },

  async getFlashcardsWithTopics(topicId?: string, topicIds?: string[]) {
    const db = await getDb()
    let flashcards = db.data.flashcards
    if (topicIds && topicIds.length > 0) {
      flashcards = flashcards.filter(f => topicIds.includes(f.topicId))
    } else if (topicId) {
      flashcards = flashcards.filter(f => f.topicId === topicId)
    }
    return flashcards.map(card => {
      const topic = db.data.topics.find(t => t.id === card.topicId)
      const classData = topic ? db.data.classes.find(c => c.id === topic.classId) : null
      return {
        ...card,
        topic: topic ? { ...topic, class: classData } : null,
      }
    })
  },
}
