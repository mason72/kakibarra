'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  FileText,
  Layers,
  Upload,
  Sparkles,
  Trash2,
  Edit2,
  Youtube,
  File,
  Image as ImageIcon,
  FileType,
  ChevronDown,
  ChevronUp,
  Brain,
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { CapybaraThinking, CapybaraHappy } from '@/components/CapybaraLogo'

interface Note {
  id: string
  name: string
  type: string
  content: string | null
  filePath: string | null
  extractedText: string | null
}

interface Flashcard {
  id: string
  question: string
  answer: string
  hint: string | null
  difficulty: number
}

interface Topic {
  id: string
  name: string
  description: string | null
  notes: Note[]
  flashcards: Flashcard[]
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

const FILE_TYPE_ICONS: Record<string, React.ElementType> = {
  pdf: FileType,
  image: ImageIcon,
  pptx: File,
  youtube: Youtube,
  text: FileText,
  docx: FileText,
  other: File,
}

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string

  const [classData, setClassData] = useState<Class | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())

  // Modal states
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)

  // Form states
  const [topicForm, setTopicForm] = useState({ name: '', description: '' })
  const [noteForm, setNoteForm] = useState({
    name: '',
    type: 'text',
    content: '',
    youtubeUrl: '',
  })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const fetchClass = useCallback(async () => {
    try {
      const res = await fetch(`/api/classes/${classId}`)
      if (!res.ok) throw new Error('Class not found')
      const data = await res.json()
      setClassData(data)
      // Auto-expand all topics
      setExpandedTopics(new Set(data.topics.map((t: Topic) => t.id)))
    } catch (error) {
      console.error('Error fetching class:', error)
      router.push('/classes')
    } finally {
      setLoading(false)
    }
  }, [classId, router])

  useEffect(() => {
    fetchClass()
  }, [fetchClass])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setUploadedFile(file)
      setNoteForm(prev => ({
        ...prev,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: getFileType(file.name),
      }))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxFiles: 1,
  })

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf': return 'pdf'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp': return 'image'
      case 'ppt':
      case 'pptx': return 'pptx'
      case 'doc':
      case 'docx': return 'docx'
      case 'txt':
      case 'md': return 'text'
      default: return 'other'
    }
  }

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topicForm.name.trim()) return

    try {
      if (editingTopic) {
        await fetch(`/api/topics/${editingTopic.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(topicForm),
        })
      } else {
        await fetch('/api/topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...topicForm, classId }),
        })
      }

      setShowTopicModal(false)
      setEditingTopic(null)
      setTopicForm({ name: '', description: '' })
      fetchClass()
    } catch (error) {
      console.error('Error saving topic:', error)
    }
  }

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteForm.name.trim() || !selectedTopicId) return

    try {
      const formData = new FormData()
      formData.append('topicId', selectedTopicId)
      formData.append('name', noteForm.name)

      if (noteForm.type === 'youtube') {
        formData.append('type', 'youtube')
        formData.append('content', noteForm.youtubeUrl)
      } else if (uploadedFile) {
        formData.append('type', noteForm.type)
        formData.append('file', uploadedFile)
      } else {
        formData.append('type', 'text')
        formData.append('content', noteForm.content)
      }

      await fetch('/api/notes', {
        method: 'POST',
        body: formData,
      })

      setShowNoteModal(false)
      setSelectedTopicId(null)
      setNoteForm({ name: '', type: 'text', content: '', youtubeUrl: '' })
      setUploadedFile(null)
      fetchClass()
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Delete this topic and all its notes and flashcards?')) return
    try {
      await fetch(`/api/topics/${topicId}`, { method: 'DELETE' })
      fetchClass()
    } catch (error) {
      console.error('Error deleting topic:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return
    try {
      await fetch(`/api/notes/${noteId}`, { method: 'DELETE' })
      fetchClass()
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const handleGenerateFlashcards = async (topicId: string) => {
    setGenerating(topicId)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, numberOfCards: 10 }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to generate flashcards')
        return
      }

      fetchClass()
    } catch (error) {
      console.error('Error generating flashcards:', error)
      alert('Failed to generate flashcards. Make sure you have set your OpenAI API key.')
    } finally {
      setGenerating(null)
    }
  }

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev)
      if (newSet.has(topicId)) {
        newSet.delete(topicId)
      } else {
        newSet.add(topicId)
      }
      return newSet
    })
  }

  const openNoteModal = (topicId: string) => {
    setSelectedTopicId(topicId)
    setNoteForm({ name: '', type: 'text', content: '', youtubeUrl: '' })
    setUploadedFile(null)
    setShowNoteModal(true)
  }

  const openEditTopicModal = (topic: Topic) => {
    setEditingTopic(topic)
    setTopicForm({ name: topic.name, description: topic.description || '' })
    setShowTopicModal(true)
  }

  if (loading || !classData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CapybaraThinking />
        <p className="mt-4 text-capy-600 font-medium">Loading class...</p>
      </div>
    )
  }

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/classes"
          className="inline-flex items-center gap-2 text-capy-500 hover:text-capy-700 mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Classes
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{classData.emoji}</span>
            <div>
              <h1 className="font-display text-3xl text-capy-800">{classData.name}</h1>
              {classData.description && (
                <p className="text-capy-600 mt-1">{classData.description}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setEditingTopic(null)
              setTopicForm({ name: '', description: '' })
              setShowTopicModal(true)
            }}
            className="btn-press flex items-center gap-2 bg-capy-500 hover:bg-capy-600 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            New Topic
          </button>
        </div>
      </div>

      {/* Topics */}
      {classData.topics.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white rounded-2xl shadow-md"
        >
          <Layers size={48} className="mx-auto text-capy-300 mb-4" />
          <h2 className="font-display text-2xl text-capy-700 mb-2">No topics yet!</h2>
          <p className="text-capy-500 mb-6">
            Create your first topic to start adding notes
          </p>
          <button
            onClick={() => {
              setEditingTopic(null)
              setTopicForm({ name: '', description: '' })
              setShowTopicModal(true)
            }}
            className="btn-press inline-flex items-center gap-2 bg-lagoon-500 hover:bg-lagoon-600 text-white font-semibold px-6 py-3 rounded-full"
          >
            <Plus size={20} />
            Create First Topic
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {classData.topics.map((topic, index) => {
            const isExpanded = expandedTopics.has(topic.id)
            const Icon = isExpanded ? ChevronUp : ChevronDown

            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                {/* Topic Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-capy-50 transition-colors"
                  onClick={() => toggleTopic(topic.id)}
                >
                  <div className="flex items-center gap-4">
                    <Icon size={20} className="text-capy-400" />
                    <div>
                      <h3 className="font-display text-lg text-capy-800">{topic.name}</h3>
                      {topic.description && (
                        <p className="text-sm text-capy-500">{topic.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 text-sm text-capy-500">
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {topic._count.notes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers size={14} />
                        {topic._count.flashcards}
                      </span>
                    </div>

                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openEditTopicModal(topic)}
                        className="p-2 text-capy-400 hover:text-capy-600 hover:bg-capy-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="p-2 text-capy-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-capy-100"
                    >
                      <div className="p-4">
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mb-4">
                          <button
                            onClick={() => openNoteModal(topic.id)}
                            className="btn-press flex items-center gap-2 bg-lagoon-100 hover:bg-lagoon-200 text-lagoon-700 font-medium px-4 py-2 rounded-xl transition-colors"
                          >
                            <Upload size={16} />
                            Add Notes
                          </button>
                          <button
                            onClick={() => handleGenerateFlashcards(topic.id)}
                            disabled={topic._count.notes === 0 || generating === topic.id}
                            className="btn-press flex items-center gap-2 bg-lily-100 hover:bg-lily-200 text-lily-700 font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {generating === topic.id ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                  <Sparkles size={16} />
                                </motion.div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles size={16} />
                                Generate Flashcards
                              </>
                            )}
                          </button>
                          {topic._count.flashcards > 0 && (
                            <Link
                              href={`/study?topics=${topic.id}`}
                              className="btn-press flex items-center gap-2 bg-capy-100 hover:bg-capy-200 text-capy-700 font-medium px-4 py-2 rounded-xl transition-colors"
                            >
                              <Brain size={16} />
                              Study This Topic
                            </Link>
                          )}
                        </div>

                        {/* Notes List */}
                        {topic.notes.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-capy-600 mb-2">Notes</h4>
                            <div className="space-y-2">
                              {topic.notes.map(note => {
                                const IconComponent = FILE_TYPE_ICONS[note.type] || File
                                return (
                                  <div
                                    key={note.id}
                                    className="flex items-center justify-between p-3 bg-capy-50 rounded-xl"
                                  >
                                    <div className="flex items-center gap-3">
                                      <IconComponent size={18} className="text-capy-500" />
                                      <span className="text-capy-700">{note.name}</span>
                                      <span className="text-xs px-2 py-0.5 bg-capy-200 text-capy-600 rounded-full">
                                        {note.type}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteNote(note.id)}
                                      className="p-1 text-capy-400 hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Flashcards Preview */}
                        {topic.flashcards.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-capy-600 mb-2">
                              Flashcards ({topic.flashcards.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {topic.flashcards.slice(0, 4).map(card => (
                                <div
                                  key={card.id}
                                  className="p-3 bg-gradient-to-br from-capy-50 to-lagoon-50 rounded-xl text-sm"
                                >
                                  <p className="text-capy-700 font-medium line-clamp-2">
                                    {card.question}
                                  </p>
                                </div>
                              ))}
                            </div>
                            {topic.flashcards.length > 4 && (
                              <p className="text-sm text-capy-500 mt-2">
                                +{topic.flashcards.length - 4} more flashcards
                              </p>
                            )}
                          </div>
                        )}

                        {topic.notes.length === 0 && topic.flashcards.length === 0 && (
                          <p className="text-capy-400 text-center py-4">
                            No notes or flashcards yet. Add some notes to get started!
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Topic Modal */}
      <AnimatePresence>
        {showTopicModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowTopicModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-display text-2xl text-capy-800 mb-6">
                {editingTopic ? 'Edit Topic' : 'Create New Topic'}
              </h2>

              <form onSubmit={handleTopicSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-capy-700 mb-2">
                    Topic Name
                  </label>
                  <input
                    type="text"
                    value={topicForm.name}
                    onChange={e => setTopicForm({ ...topicForm, name: e.target.value })}
                    placeholder="e.g., Chapter 5: Cell Biology"
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
                    value={topicForm.description}
                    onChange={e => setTopicForm({ ...topicForm, description: e.target.value })}
                    placeholder="e.g., For the midterm exam"
                    className="w-full px-4 py-3 rounded-xl border border-capy-200 focus:border-capy-500 focus:ring-2 focus:ring-capy-200 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTopicModal(false)}
                    className="flex-1 py-3 text-capy-600 font-medium rounded-xl border border-capy-200 hover:bg-capy-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-capy-500 hover:bg-capy-600 text-white font-medium rounded-xl transition-colors"
                  >
                    {editingTopic ? 'Save Changes' : 'Create Topic'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note Upload Modal */}
      <AnimatePresence>
        {showNoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-display text-2xl text-capy-800 mb-6">Add Notes</h2>

              <form onSubmit={handleNoteSubmit} className="space-y-4">
                {/* Tab Selection */}
                <div className="flex gap-2 p-1 bg-capy-100 rounded-xl">
                  {[
                    { type: 'upload', label: 'Upload File', icon: Upload },
                    { type: 'text', label: 'Text Notes', icon: FileText },
                    { type: 'youtube', label: 'YouTube', icon: Youtube },
                  ].map(tab => (
                    <button
                      key={tab.type}
                      type="button"
                      onClick={() => {
                        setNoteForm(prev => ({ ...prev, type: tab.type }))
                        setUploadedFile(null)
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
                        (noteForm.type === tab.type || (tab.type === 'upload' && uploadedFile))
                          ? 'bg-white text-capy-700 shadow-sm'
                          : 'text-capy-500 hover:text-capy-700'
                      }`}
                    >
                      <tab.icon size={16} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* File Upload */}
                {(noteForm.type === 'upload' || uploadedFile) && noteForm.type !== 'youtube' && noteForm.type !== 'text' && (
                  <div>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        isDragActive
                          ? 'border-lagoon-500 bg-lagoon-50'
                          : uploadedFile
                          ? 'border-green-500 bg-green-50'
                          : 'border-capy-300 hover:border-capy-400 hover:bg-capy-50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      {uploadedFile ? (
                        <div className="text-green-600">
                          <File size={32} className="mx-auto mb-2" />
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-sm">Click or drag to replace</p>
                        </div>
                      ) : (
                        <div className="text-capy-500">
                          <Upload size={32} className="mx-auto mb-2" />
                          <p className="font-medium">
                            {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
                          </p>
                          <p className="text-sm mt-1">
                            PDF, Images, PowerPoint, Word, Text files
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Text Notes */}
                {noteForm.type === 'text' && !uploadedFile && (
                  <div>
                    <label className="block text-sm font-medium text-capy-700 mb-2">
                      Paste or type your notes
                    </label>
                    <textarea
                      value={noteForm.content}
                      onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
                      placeholder="Paste your notes here..."
                      className="w-full px-4 py-3 rounded-xl border border-capy-200 focus:border-capy-500 focus:ring-2 focus:ring-capy-200 outline-none transition-all h-40 resize-none"
                    />
                  </div>
                )}

                {/* YouTube URL */}
                {noteForm.type === 'youtube' && (
                  <div>
                    <label className="block text-sm font-medium text-capy-700 mb-2">
                      YouTube Video URL
                    </label>
                    <input
                      type="url"
                      value={noteForm.youtubeUrl}
                      onChange={e => setNoteForm({ ...noteForm, youtubeUrl: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 rounded-xl border border-capy-200 focus:border-capy-500 focus:ring-2 focus:ring-capy-200 outline-none transition-all"
                    />
                    <p className="text-sm text-capy-500 mt-2">
                      Tip: Watch the video and add your own notes for better flashcards!
                    </p>
                  </div>
                )}

                {/* Note Name */}
                <div>
                  <label className="block text-sm font-medium text-capy-700 mb-2">
                    Note Name
                  </label>
                  <input
                    type="text"
                    value={noteForm.name}
                    onChange={e => setNoteForm({ ...noteForm, name: e.target.value })}
                    placeholder="e.g., Lecture Notes Week 3"
                    className="w-full px-4 py-3 rounded-xl border border-capy-200 focus:border-capy-500 focus:ring-2 focus:ring-capy-200 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
                    className="flex-1 py-3 text-capy-600 font-medium rounded-xl border border-capy-200 hover:bg-capy-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-lagoon-500 hover:bg-lagoon-600 text-white font-medium rounded-xl transition-colors"
                  >
                    Add Note
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success indicator when generating */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4"
          >
            <CapybaraHappy className="w-12 h-12" />
            <div>
              <p className="font-medium text-capy-700">Generating flashcards...</p>
              <p className="text-sm text-capy-500">Our capybara is working hard!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
