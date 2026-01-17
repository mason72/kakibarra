'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Brain,
  Check,
  X,
  RotateCcw,
  Lightbulb,
  ChevronRight,
  Trophy,
  Layers,
} from 'lucide-react'
import {
  CapybaraThinking,
  CapybaraHappy,
  CapybaraSwimming,
} from '@/components/CapybaraLogo'

interface Flashcard {
  id: string
  question: string
  answer: string
  hint: string | null
  difficulty: number
  topic: {
    id: string
    name: string
    class: {
      id: string
      name: string
      emoji: string
    }
  }
}

interface Topic {
  id: string
  name: string
  class: {
    id: string
    name: string
    emoji: string
  }
  _count: {
    flashcards: number
  }
}

function StudyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const topicIdsParam = searchParams.get('topics')

  const [mode, setMode] = useState<'select' | 'study' | 'complete'>('select')
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([])
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [results, setResults] = useState<{ correct: number; incorrect: number }>({
    correct: 0,
    incorrect: 0,
  })
  const [loading, setLoading] = useState(true)
  const [startTime] = useState(Date.now())

  const fetchTopics = useCallback(async () => {
    try {
      const res = await fetch('/api/topics')
      const data = await res.json()
      // Only show topics that have flashcards
      const topicsWithFlashcards = data.filter((t: Topic) => t._count.flashcards > 0)
      setAvailableTopics(topicsWithFlashcards)

      // If topics were passed in URL, pre-select them
      if (topicIdsParam) {
        const ids = topicIdsParam.split(',')
        setSelectedTopicIds(ids)
      }
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setLoading(false)
    }
  }, [topicIdsParam])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  // Auto-start if topics were provided in URL
  useEffect(() => {
    if (topicIdsParam && availableTopics.length > 0 && mode === 'select') {
      startStudySession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicIdsParam, availableTopics])

  const startStudySession = async () => {
    if (selectedTopicIds.length === 0) return

    setLoading(true)
    try {
      const res = await fetch(`/api/flashcards?topicIds=${selectedTopicIds.join(',')}`)
      const data = await res.json()

      // Shuffle flashcards
      const shuffled = [...data].sort(() => Math.random() - 0.5)
      setFlashcards(shuffled)
      setCurrentIndex(0)
      setResults({ correct: 0, incorrect: 0 })
      setMode('study')
    } catch (error) {
      console.error('Error fetching flashcards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (correct: boolean) => {
    const card = flashcards[currentIndex]

    // Update card statistics
    await fetch(`/api/flashcards/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timesStudied: 1, // Will be incremented on server
        timesCorrect: correct ? 1 : 0,
        lastStudied: new Date().toISOString(),
      }),
    })

    setResults(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }))

    // Move to next card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setShowAnswer(false)
      setShowHint(false)
    } else {
      // Session complete
      const duration = Math.floor((Date.now() - startTime) / 1000)

      // Save study session
      await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicIds: selectedTopicIds,
          totalCards: flashcards.length,
          correctAnswers: results.correct + (correct ? 1 : 0),
          duration,
        }),
      })

      setMode('complete')
    }
  }

  const toggleTopic = (topicId: string) => {
    setSelectedTopicIds(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    )
  }

  const restartSession = () => {
    setMode('select')
    setFlashcards([])
    setCurrentIndex(0)
    setResults({ correct: 0, incorrect: 0 })
    setShowAnswer(false)
    setShowHint(false)
    router.push('/study')
  }

  const progress = flashcards.length > 0
    ? ((currentIndex + (showAnswer ? 1 : 0)) / flashcards.length) * 100
    : 0

  const currentCard = flashcards[currentIndex]

  if (loading && availableTopics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CapybaraThinking />
        <p className="mt-4 text-capy-600 font-medium">Loading...</p>
      </div>
    )
  }

  // Topic Selection Mode
  if (mode === 'select') {
    return (
      <div className="page-transition max-w-3xl mx-auto">
        <h1 className="font-display text-3xl text-capy-800 mb-2 text-center">
          Study Session
        </h1>
        <p className="text-capy-600 text-center mb-8">
          Select the topics you want to study
        </p>

        {availableTopics.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl shadow-md"
          >
            <Brain size={48} className="mx-auto text-capy-300 mb-4" />
            <h2 className="font-display text-2xl text-capy-700 mb-2">
              No flashcards yet!
            </h2>
            <p className="text-capy-500 mb-6">
              Add some notes and generate flashcards first
            </p>
            <Link
              href="/classes"
              className="btn-press inline-flex items-center gap-2 bg-capy-500 hover:bg-capy-600 text-white font-semibold px-6 py-3 rounded-full"
            >
              Go to My Classes
              <ChevronRight size={18} />
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Group topics by class */}
            {Object.entries(
              availableTopics.reduce((acc, topic) => {
                const classId = topic.class.id
                if (!acc[classId]) {
                  acc[classId] = {
                    class: topic.class,
                    topics: [],
                  }
                }
                acc[classId].topics.push(topic)
                return acc
              }, {} as Record<string, { class: Topic['class']; topics: Topic[] }>)
            ).map(([classId, { class: cls, topics }]) => (
              <div key={classId} className="mb-6">
                <h3 className="font-display text-lg text-capy-700 mb-3 flex items-center gap-2">
                  <span>{cls.emoji}</span>
                  {cls.name}
                </h3>
                <div className="grid gap-2">
                  {topics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => toggleTopic(topic.id)}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        selectedTopicIds.includes(topic.id)
                          ? 'bg-lagoon-100 ring-2 ring-lagoon-500'
                          : 'bg-white hover:bg-capy-50 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedTopicIds.includes(topic.id)
                              ? 'border-lagoon-500 bg-lagoon-500'
                              : 'border-capy-300'
                          }`}
                        >
                          {selectedTopicIds.includes(topic.id) && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <span className="font-medium text-capy-700">{topic.name}</span>
                      </div>
                      <span className="text-sm text-capy-500 flex items-center gap-1">
                        <Layers size={14} />
                        {topic._count.flashcards} cards
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-8 flex justify-center">
              <button
                onClick={startStudySession}
                disabled={selectedTopicIds.length === 0}
                className="btn-press flex items-center gap-2 bg-lagoon-500 hover:bg-lagoon-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain size={20} />
                Start Studying ({selectedTopicIds.length} topic{selectedTopicIds.length !== 1 ? 's' : ''})
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  // Study Mode
  if (mode === 'study' && currentCard) {
    return (
      <div className="page-transition max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <CapybaraSwimming progress={progress} />
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <span className="flex items-center gap-2 text-green-600">
            <Check size={16} />
            {results.correct} correct
          </span>
          <span className="text-capy-400">
            {currentIndex + 1} / {flashcards.length}
          </span>
          <span className="flex items-center gap-2 text-red-500">
            <X size={16} />
            {results.incorrect} incorrect
          </span>
        </div>

        {/* Flashcard */}
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flip-card"
        >
          <div
            className={`bg-white rounded-3xl shadow-xl p-8 min-h-[300px] flex flex-col ${
              showAnswer ? 'flip-card flipped' : ''
            }`}
          >
            {/* Topic Badge */}
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-capy-100 text-capy-600 rounded-full text-sm">
                {currentCard.topic.class.emoji} {currentCard.topic.name}
              </span>
            </div>

            {/* Question */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              {!showAnswer ? (
                <>
                  <h2 className="font-display text-2xl text-capy-800 mb-4">
                    {currentCard.question}
                  </h2>

                  {/* Hint */}
                  {currentCard.hint && (
                    <AnimatePresence>
                      {showHint ? (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-capy-500 bg-capy-50 px-4 py-2 rounded-xl"
                        >
                          💡 {currentCard.hint}
                        </motion.p>
                      ) : (
                        <button
                          onClick={() => setShowHint(true)}
                          className="flex items-center gap-2 text-capy-400 hover:text-capy-600 transition-colors"
                        >
                          <Lightbulb size={16} />
                          Show hint
                        </button>
                      )}
                    </AnimatePresence>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-sm text-capy-400 mb-2">Answer:</p>
                  <h2 className="font-display text-2xl text-lagoon-700">
                    {currentCard.answer}
                  </h2>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6">
              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="btn-press w-full py-4 bg-capy-500 hover:bg-capy-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Show Answer
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAnswer(false)}
                    className="btn-press flex-1 flex items-center justify-center gap-2 py-4 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl transition-colors"
                  >
                    <X size={20} />
                    Incorrect
                  </button>
                  <button
                    onClick={() => handleAnswer(true)}
                    className="btn-press flex-1 flex items-center justify-center gap-2 py-4 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-xl transition-colors"
                  >
                    <Check size={20} />
                    Correct
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Difficulty indicator */}
        <div className="mt-4 text-center">
          <span className="text-sm text-capy-400">
            Difficulty: {'⭐'.repeat(currentCard.difficulty)}{'☆'.repeat(5 - currentCard.difficulty)}
          </span>
        </div>
      </div>
    )
  }

  // Complete Mode
  if (mode === 'complete') {
    const totalCards = results.correct + results.incorrect
    const percentage = Math.round((results.correct / totalCards) * 100)

    return (
      <div className="page-transition max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <CapybaraHappy className="mx-auto mb-4" />

          <h1 className="font-display text-3xl text-capy-800 mb-2">
            🎉 Session Complete!
          </h1>

          <p className="text-capy-600 mb-8">
            Great job! You made it across the lagoon!
          </p>

          {/* Results */}
          <div className="bg-gradient-to-r from-capy-50 to-lagoon-50 rounded-2xl p-6 mb-8">
            <div className="text-5xl font-display text-lagoon-600 mb-2">
              {percentage}%
            </div>
            <p className="text-capy-600 mb-4">
              {results.correct} out of {totalCards} correct
            </p>

            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-display text-green-600">
                  {results.correct}
                </div>
                <div className="text-sm text-capy-500">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-display text-red-500">
                  {results.incorrect}
                </div>
                <div className="text-sm text-capy-500">Incorrect</div>
              </div>
            </div>
          </div>

          {/* Achievement message */}
          <div className="mb-8">
            {percentage === 100 ? (
              <div className="flex items-center justify-center gap-2 text-lagoon-600">
                <Trophy size={24} />
                <span className="font-display text-lg">Perfect score! Amazing!</span>
              </div>
            ) : percentage >= 80 ? (
              <p className="text-lagoon-600">Excellent work! Keep it up! 🌟</p>
            ) : percentage >= 60 ? (
              <p className="text-capy-600">Good effort! Practice makes perfect! 💪</p>
            ) : (
              <p className="text-capy-600">Keep studying! You&apos;ve got this! 🌿</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={restartSession}
              className="btn-press flex items-center justify-center gap-2 px-6 py-3 bg-capy-100 hover:bg-capy-200 text-capy-700 font-semibold rounded-full transition-colors"
            >
              <RotateCcw size={18} />
              Study Again
            </button>
            <Link
              href="/classes"
              className="btn-press flex items-center justify-center gap-2 px-6 py-3 bg-lagoon-500 hover:bg-lagoon-600 text-white font-semibold rounded-full transition-colors"
            >
              Back to Classes
              <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}

export default function StudyPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <CapybaraThinking />
        <p className="mt-4 text-capy-600 font-medium">Loading...</p>
      </div>
    }>
      <StudyContent />
    </Suspense>
  )
}
