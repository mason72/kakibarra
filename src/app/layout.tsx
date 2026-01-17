import type { Metadata } from 'next'
import { Nunito, Fredoka } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
})

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
})

export const metadata: Metadata = {
  title: 'CapyStudy - Learn with your friendly Capybara',
  description: 'A cute capybara-themed study app for flashcards and quizzes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${fredoka.variable} font-sans`}>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1 container mx-auto px-4 py-6">
            {children}
          </main>
          <footer className="text-center py-4 text-capy-600 text-sm">
            <p>Made with 🧡 by CapyStudy</p>
          </footer>
        </div>
      </body>
    </html>
  )
}
