'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, GraduationCap, BarChart3 } from 'lucide-react'
import { CapybaraLogo } from './CapybaraLogo'

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/classes', label: 'My Classes', icon: BookOpen },
    { href: '/study', label: 'Study', icon: GraduationCap },
    { href: '/progress', label: 'Progress', icon: BarChart3 },
  ]

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <CapybaraLogo size="sm" animate={false} />
            <span className="font-display text-2xl text-capy-700 group-hover:text-capy-600 transition-colors">
              CapyStudy
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
                    ${isActive
                      ? 'bg-capy-500 text-white shadow-md'
                      : 'text-capy-700 hover:bg-capy-100'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline font-medium">{label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
