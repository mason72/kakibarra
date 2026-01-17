'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Upload, Brain, Trophy } from 'lucide-react'
import { CapybaraLogo, CapybaraHappy } from '@/components/CapybaraLogo'

export default function HomePage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Organize by Class',
      description: 'Keep your subjects and topics neat and tidy',
      color: 'bg-capy-100 text-capy-700',
    },
    {
      icon: Upload,
      title: 'Upload Anything',
      description: 'PDFs, photos, PowerPoints, YouTube links - we handle it all!',
      color: 'bg-lagoon-100 text-lagoon-700',
    },
    {
      icon: Brain,
      title: 'AI Flashcards',
      description: 'Let our smart capybara create flashcards from your notes',
      color: 'bg-lily-100 text-lily-700',
    },
    {
      icon: Trophy,
      title: 'Track Progress',
      description: 'Watch your capybara swim across the lagoon as you learn!',
      color: 'bg-capy-100 text-capy-700',
    },
  ]

  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <CapybaraLogo size="xl" />
          </div>

          <h1 className="font-display text-4xl md:text-6xl text-capy-800 mb-4">
            Welcome to <span className="text-capy-600">CapyStudy!</span>
          </h1>

          <p className="text-xl text-capy-600 mb-8 max-w-xl mx-auto">
            Your chill study buddy that turns your notes into flashcards and quizzes.
            Learn at your own pace - no stress, just progress! 🌿
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/classes"
              className="btn-press inline-flex items-center justify-center gap-2 bg-capy-500 hover:bg-capy-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <BookOpen size={20} />
              Get Started
            </Link>
            <Link
              href="/study"
              className="btn-press inline-flex items-center justify-center gap-2 bg-lagoon-500 hover:bg-lagoon-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Brain size={20} />
              Start Studying
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon size={24} />
              </div>
              <h3 className="font-display text-xl text-capy-800 mb-2">{feature.title}</h3>
              <p className="text-capy-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <h2 className="font-display text-3xl text-capy-800 text-center mb-10">
          How It Works
        </h2>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Add Your Notes',
                description: 'Upload PDFs, photos, PowerPoints, or paste YouTube links from your classes',
              },
              {
                step: '2',
                title: 'Generate Flashcards',
                description: 'Our AI reads your notes and creates smart flashcards and quizzes',
              },
              {
                step: '3',
                title: 'Study & Track',
                description: 'Study at your pace and watch your capybara swim to success!',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-lagoon-500 text-white rounded-full flex items-center justify-center text-2xl font-display mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-display text-xl text-capy-800 mb-2">{item.title}</h3>
                <p className="text-capy-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-capy-500 to-capy-600 rounded-3xl p-8 md:p-12 text-center text-white"
        >
          <div className="flex justify-center mb-4">
            <CapybaraHappy className="drop-shadow-lg" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Ready to ace your next test?
          </h2>
          <p className="text-capy-100 mb-6 max-w-md mx-auto">
            Join our capybara on a relaxing study journey. Learning has never been this chill!
          </p>
          <Link
            href="/classes"
            className="btn-press inline-flex items-center gap-2 bg-white text-capy-700 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-capy-50"
          >
            Let&apos;s Go! 🌊
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
