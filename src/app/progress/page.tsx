'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Calendar,
  Trophy,
  Target,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { CapybaraThinking, CapybaraHappy, CapybaraSwimming } from '@/components/CapybaraLogo'

interface StudySession {
  id: string
  topicIds: string[]
  totalCards: number
  correctAnswers: number
  duration: number
  completedAt: string
}

interface Stats {
  totalSessions: number
  totalCards: number
  totalCorrect: number
  totalTime: number
  averageAccuracy: number
  streak: number
}

export default function ProgressPage() {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    totalCards: 0,
    totalCorrect: 0,
    totalTime: 0,
    averageAccuracy: 0,
    streak: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/study-sessions?limit=50')
      const data = await res.json()
      setSessions(data)

      // Calculate stats
      if (data.length > 0) {
        const totalCards = data.reduce((acc: number, s: StudySession) => acc + s.totalCards, 0)
        const totalCorrect = data.reduce((acc: number, s: StudySession) => acc + s.correctAnswers, 0)
        const totalTime = data.reduce((acc: number, s: StudySession) => acc + s.duration, 0)

        // Calculate streak (consecutive days)
        let streak = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today)
          checkDate.setDate(checkDate.getDate() - i)
          const hasSession = data.some((s: StudySession) => {
            const sessionDate = new Date(s.completedAt)
            sessionDate.setHours(0, 0, 0, 0)
            return sessionDate.getTime() === checkDate.getTime()
          })

          if (hasSession) {
            streak++
          } else if (i > 0) {
            break
          }
        }

        setStats({
          totalSessions: data.length,
          totalCards,
          totalCorrect,
          totalTime,
          averageAccuracy: totalCards > 0 ? Math.round((totalCorrect / totalCards) * 100) : 0,
          streak,
        })
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins < 60) return `${mins}m ${secs}s`
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}h ${remainingMins}m`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CapybaraThinking />
        <p className="mt-4 text-capy-600 font-medium">Loading your progress...</p>
      </div>
    )
  }

  return (
    <div className="page-transition max-w-4xl mx-auto">
      <h1 className="font-display text-3xl text-capy-800 mb-2">Your Progress</h1>
      <p className="text-capy-600 mb-8">Track your learning journey</p>

      {sessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white rounded-2xl shadow-md"
        >
          <BarChart3 size={48} className="mx-auto text-capy-300 mb-4" />
          <h2 className="font-display text-2xl text-capy-700 mb-2">
            No study sessions yet!
          </h2>
          <p className="text-capy-500 mb-6">
            Complete your first study session to see your progress
          </p>
        </motion.div>
      ) : (
        <>
          {/* Overall Progress */}
          <div className="mb-8">
            <CapybaraSwimming
              progress={Math.min(100, stats.totalCards / 5)}
              className="mb-4"
            />
            <p className="text-center text-capy-600">
              {stats.totalCards < 500
                ? `Keep going! ${500 - stats.totalCards} more cards to become a study master!`
                : `Amazing! You've studied over 500 cards! 🎉`}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: Target,
                label: 'Total Sessions',
                value: stats.totalSessions,
                color: 'bg-capy-100 text-capy-700',
              },
              {
                icon: TrendingUp,
                label: 'Accuracy',
                value: `${stats.averageAccuracy}%`,
                color: 'bg-lagoon-100 text-lagoon-700',
              },
              {
                icon: Trophy,
                label: 'Cards Mastered',
                value: stats.totalCorrect,
                color: 'bg-lily-100 text-lily-700',
              },
              {
                icon: Calendar,
                label: 'Day Streak',
                value: `${stats.streak} 🔥`,
                color: 'bg-orange-100 text-orange-700',
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-md"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon size={20} />
                </div>
                <div className="font-display text-2xl text-capy-800">{stat.value}</div>
                <div className="text-sm text-capy-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Time Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-lagoon-500 to-lagoon-600 rounded-2xl p-6 mb-8 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Clock size={32} />
              </div>
              <div>
                <div className="font-display text-3xl">{formatDuration(stats.totalTime)}</div>
                <div className="text-lagoon-100">Total study time</div>
              </div>
              <div className="ml-auto">
                <CapybaraHappy className="w-20 h-20 opacity-80" />
              </div>
            </div>
          </motion.div>

          {/* Recent Sessions */}
          <div>
            <h2 className="font-display text-xl text-capy-800 mb-4">Recent Sessions</h2>
            <div className="space-y-3">
              {sessions.slice(0, 10).map((session, index) => {
                const accuracy = Math.round((session.correctAnswers / session.totalCards) * 100)
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-display text-lg ${
                          accuracy >= 80
                            ? 'bg-green-100 text-green-700'
                            : accuracy >= 60
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {accuracy}%
                      </div>
                      <div>
                        <div className="font-medium text-capy-700">
                          {session.correctAnswers} / {session.totalCards} correct
                        </div>
                        <div className="text-sm text-capy-500">
                          {formatDuration(session.duration)} • {formatDate(session.completedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {accuracy === 100 && (
                        <span className="text-xl">🏆</span>
                      )}
                      {accuracy >= 80 && accuracy < 100 && (
                        <span className="text-xl">⭐</span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
