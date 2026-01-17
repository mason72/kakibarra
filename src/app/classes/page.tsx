'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  BookOpen,
  FileText,
  Layers,
  Trash2,
  Edit2,
  ChevronRight,
} from 'lucide-react'
import { CapybaraThinking } from '@/components/CapybaraLogo'

interface Topic {
  id: string
  name: string
  description: string | null
  _count: {
    flashcards: number
    notes: number
  }
}

interface Class {
  id: string
  name: string
  description: string | null
  color: string
  emoji: string
  topics: Topic[]
}

const CLASS_EMOJIS = ['📚', '🔬', '🧮', '🌍', '📝', '🎨', '🎵', '💻', '🏛️', '⚗️', '📖', '🔢']
const CLASS_COLORS = [
  '#d4873f', // capy orange
  '#38967d', // lagoon teal
  '#e85a95', // lily pink
  '#5b8fd9', // sky blue
  '#9b5de5', // purple
  '#f15bb5', // hot pink
  '#00bbf9', // cyan
  '#00f5d4', // mint
  '#fee440', // yellow
  '#ff6b6b', // coral
]

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emoji: '📚',
    color: '#d4873f',
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      const data = await res.json()
      setClasses(data)
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      if (editingClass) {
        await fetch(`/api/classes/${editingClass.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }

      setShowModal(false)
      setEditingClass(null)
      setFormData({ name: '', description: '', emoji: '📚', color: '#d4873f' })
      fetchClasses()
    } catch (error) {
      console.error('Error saving class:', error)
    }
  }

  const handleDelete = async (classId: string) => {
    if (!confirm('Are you sure? This will delete all topics, notes, and flashcards in this class.')) {
      return
    }

    try {
      await fetch(`/api/classes/${classId}`, { method: 'DELETE' })
      fetchClasses()
    } catch (error) {
      console.error('Error deleting class:', error)
    }
  }

  const openEditModal = (cls: Class) => {
    setEditingClass(cls)
    setFormData({
      name: cls.name,
      description: cls.description || '',
      emoji: cls.emoji,
      color: cls.color,
    })
    setShowModal(true)
  }

  const openNewModal = () => {
    setEditingClass(null)
    setFormData({ name: '', description: '', emoji: '📚', color: '#d4873f' })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CapybaraThinking />
        <p className="mt-4 text-capy-600 font-medium">Loading your classes...</p>
      </div>
    )
  }

  return (
    <div className="page-transition">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-capy-800">My Classes</h1>
          <p className="text-capy-600 mt-1">Organize your subjects and topics</p>
        </div>
        <button
          onClick={openNewModal}
          className="btn-press flex items-center gap-2 bg-capy-500 hover:bg-capy-600 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          New Class
        </button>
      </div>

      {classes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white rounded-2xl shadow-md"
        >
          <BookOpen size={48} className="mx-auto text-capy-300 mb-4" />
          <h2 className="font-display text-2xl text-capy-700 mb-2">No classes yet!</h2>
          <p className="text-capy-500 mb-6">
            Create your first class to start organizing your notes
          </p>
          <button
            onClick={openNewModal}
            className="btn-press inline-flex items-center gap-2 bg-lagoon-500 hover:bg-lagoon-600 text-white font-semibold px-6 py-3 rounded-full"
          >
            <Plus size={20} />
            Create Your First Class
          </button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div
                className="h-2"
                style={{ backgroundColor: cls.color }}
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cls.emoji}</span>
                    <div>
                      <h3 className="font-display text-xl text-capy-800">{cls.name}</h3>
                      {cls.description && (
                        <p className="text-sm text-capy-500 mt-1">{cls.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(cls)}
                      className="p-2 text-capy-400 hover:text-capy-600 hover:bg-capy-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id)}
                      className="p-2 text-capy-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-capy-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Layers size={14} />
                    {cls.topics.length} topics
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={14} />
                    {cls.topics.reduce((acc, t) => acc + t._count.notes, 0)} notes
                  </span>
                </div>

                <Link
                  href={`/classes/${cls.id}`}
                  className="btn-press flex items-center justify-center gap-2 w-full py-3 bg-capy-50 hover:bg-capy-100 text-capy-700 font-medium rounded-xl transition-colors"
                >
                  Open Class
                  <ChevronRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-display text-2xl text-capy-800 mb-6">
                {editingClass ? 'Edit Class' : 'Create New Class'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-capy-700 mb-2">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., AP Biology"
                    className="w-full px-4 py-3 rounded-xl border border-capy-200 focus:border-capy-500 focus:ring-2 focus:ring-capy-200 outline-none transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-capy-700 mb-2">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Period 3 with Ms. Smith"
                    className="w-full px-4 py-3 rounded-xl border border-capy-200 focus:border-capy-500 focus:ring-2 focus:ring-capy-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-capy-700 mb-2">
                    Emoji
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CLASS_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, emoji })}
                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                          formData.emoji === emoji
                            ? 'bg-capy-100 ring-2 ring-capy-500'
                            : 'bg-capy-50 hover:bg-capy-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-capy-700 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CLASS_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full transition-all ${
                          formData.color === color
                            ? 'ring-2 ring-offset-2 ring-capy-500 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 text-capy-600 font-medium rounded-xl border border-capy-200 hover:bg-capy-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-capy-500 hover:bg-capy-600 text-white font-medium rounded-xl transition-colors"
                  >
                    {editingClass ? 'Save Changes' : 'Create Class'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
