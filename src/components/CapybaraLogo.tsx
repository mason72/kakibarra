'use client'

import { motion } from 'framer-motion'

interface CapybaraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
  className?: string
}

export function CapybaraLogo({ size = 'md', animate = true, className = '' }: CapybaraLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  }

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={`${sizeClasses[size]} ${className}`}
      animate={animate ? { y: [0, -4, 0] } : undefined}
      transition={animate ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {/* Body */}
      <ellipse cx="50" cy="60" rx="35" ry="25" fill="#a5562c" />

      {/* Head */}
      <ellipse cx="50" cy="35" rx="25" ry="20" fill="#c66f33" />

      {/* Snout */}
      <ellipse cx="50" cy="45" rx="15" ry="12" fill="#d4873f" />

      {/* Nose */}
      <ellipse cx="50" cy="42" rx="5" ry="3" fill="#3a1d12" />

      {/* Left Eye */}
      <circle cx="40" cy="30" r="5" fill="#3a1d12" />
      <circle cx="41" cy="29" r="2" fill="white" />

      {/* Right Eye */}
      <circle cx="60" cy="30" r="5" fill="#3a1d12" />
      <circle cx="61" cy="29" r="2" fill="white" />

      {/* Left Ear */}
      <ellipse cx="30" cy="22" rx="6" ry="4" fill="#a5562c" />

      {/* Right Ear */}
      <ellipse cx="70" cy="22" rx="6" ry="4" fill="#a5562c" />

      {/* Cheek marks (whisker dots) */}
      <circle cx="35" cy="40" r="2" fill="#85462a" />
      <circle cx="65" cy="40" r="2" fill="#85462a" />

      {/* Cute blush */}
      <ellipse cx="32" cy="38" rx="4" ry="2" fill="#f285b5" opacity="0.5" />
      <ellipse cx="68" cy="38" rx="4" ry="2" fill="#f285b5" opacity="0.5" />

      {/* Front legs */}
      <ellipse cx="35" cy="80" rx="6" ry="8" fill="#85462a" />
      <ellipse cx="65" cy="80" rx="6" ry="8" fill="#85462a" />
    </motion.svg>
  )
}

export function CapybaraSwimming({ progress, className = '' }: { progress: number; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Lagoon/Water background */}
      <div className="h-16 bg-gradient-to-b from-lagoon-300 to-lagoon-500 rounded-full overflow-hidden relative">
        {/* Progress fill (water traveled) */}
        <div
          className="absolute inset-y-0 left-0 lagoon-water transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />

        {/* Lily pads decoration */}
        <div className="absolute inset-0 flex items-center">
          {[20, 40, 60, 80].map((pos) => (
            <div
              key={pos}
              className="absolute lily-float"
              style={{ left: `${pos}%`, opacity: progress > pos ? 0.3 : 0.8 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill="#38967d" />
                <path d="M10 2 L10 10" stroke="#246153" strokeWidth="2" />
              </svg>
            </div>
          ))}
        </div>

        {/* Swimming Capybara */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: `calc(${Math.min(progress, 95)}% - 20px)` }}
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="40" height="32" viewBox="0 0 50 40">
            {/* Water splash */}
            <ellipse cx="10" cy="25" rx="8" ry="4" fill="#b9e3d4" opacity="0.6" />

            {/* Body in water */}
            <ellipse cx="25" cy="28" rx="18" ry="10" fill="#a5562c" />

            {/* Head above water */}
            <ellipse cx="35" cy="18" rx="12" ry="10" fill="#c66f33" />

            {/* Snout */}
            <ellipse cx="42" cy="20" rx="6" ry="5" fill="#d4873f" />

            {/* Nose */}
            <ellipse cx="45" cy="19" rx="2" ry="1.5" fill="#3a1d12" />

            {/* Eye */}
            <circle cx="36" cy="14" r="3" fill="#3a1d12" />
            <circle cx="37" cy="13" r="1" fill="white" />

            {/* Ear */}
            <ellipse cx="28" cy="10" rx="3" ry="2" fill="#a5562c" />

            {/* Blush */}
            <ellipse cx="40" cy="22" rx="2" ry="1" fill="#f285b5" opacity="0.5" />
          </svg>
        </motion.div>

        {/* Finish flag */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <svg width="20" height="24" viewBox="0 0 20 24">
            <rect x="2" y="0" width="2" height="24" fill="#6c3b25" />
            <rect x="4" y="2" width="14" height="10" fill="#e85a95" />
            <text x="8" y="10" fontSize="8" fill="white">🎉</text>
          </svg>
        </div>
      </div>

      {/* Progress text */}
      <div className="text-center mt-2 font-display text-capy-700">
        {progress < 100 ? (
          <span>Keep swimming! {Math.round(progress)}% complete</span>
        ) : (
          <span className="text-lagoon-600">🎉 You made it across!</span>
        )}
      </div>
    </div>
  )
}

export function CapybaraHappy({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={`w-24 h-24 ${className}`}
      animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Body */}
      <ellipse cx="50" cy="65" rx="35" ry="25" fill="#a5562c" />

      {/* Head */}
      <ellipse cx="50" cy="35" rx="25" ry="20" fill="#c66f33" />

      {/* Snout */}
      <ellipse cx="50" cy="45" rx="15" ry="12" fill="#d4873f" />

      {/* Big smile */}
      <path
        d="M 38 48 Q 50 58 62 48"
        stroke="#3a1d12"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Nose */}
      <ellipse cx="50" cy="42" rx="5" ry="3" fill="#3a1d12" />

      {/* Happy closed eyes */}
      <path d="M 35 30 Q 40 26 45 30" stroke="#3a1d12" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 55 30 Q 60 26 65 30" stroke="#3a1d12" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Ears */}
      <ellipse cx="30" cy="20" rx="6" ry="4" fill="#a5562c" />
      <ellipse cx="70" cy="20" rx="6" ry="4" fill="#a5562c" />

      {/* Big rosy cheeks */}
      <ellipse cx="30" cy="40" rx="6" ry="4" fill="#f285b5" opacity="0.6" />
      <ellipse cx="70" cy="40" rx="6" ry="4" fill="#f285b5" opacity="0.6" />

      {/* Sparkles */}
      <text x="15" y="20" fontSize="12">✨</text>
      <text x="75" y="15" fontSize="10">✨</text>

      {/* Raised arms/paws */}
      <ellipse cx="20" cy="55" rx="8" ry="6" fill="#85462a" transform="rotate(-30 20 55)" />
      <ellipse cx="80" cy="55" rx="8" ry="6" fill="#85462a" transform="rotate(30 80 55)" />
    </motion.svg>
  )
}

export function CapybaraThinking({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={`w-24 h-24 ${className}`}
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Body */}
      <ellipse cx="50" cy="65" rx="35" ry="25" fill="#a5562c" />

      {/* Head tilted */}
      <ellipse cx="52" cy="35" rx="25" ry="20" fill="#c66f33" />

      {/* Snout */}
      <ellipse cx="54" cy="45" rx="15" ry="12" fill="#d4873f" />

      {/* Thinking mouth */}
      <ellipse cx="54" cy="50" rx="4" ry="2" fill="#3a1d12" />

      {/* Nose */}
      <ellipse cx="54" cy="42" rx="5" ry="3" fill="#3a1d12" />

      {/* Eyes looking up */}
      <circle cx="42" cy="28" r="5" fill="#3a1d12" />
      <circle cx="44" cy="26" r="2" fill="white" />
      <circle cx="62" cy="28" r="5" fill="#3a1d12" />
      <circle cx="64" cy="26" r="2" fill="white" />

      {/* Raised eyebrow */}
      <path d="M 58 22 Q 62 18 68 22" stroke="#85462a" strokeWidth="2" fill="none" />

      {/* Ears */}
      <ellipse cx="32" cy="20" rx="6" ry="4" fill="#a5562c" />
      <ellipse cx="72" cy="18" rx="6" ry="4" fill="#a5562c" />

      {/* Light blush */}
      <ellipse cx="34" cy="40" rx="4" ry="2" fill="#f285b5" opacity="0.4" />
      <ellipse cx="72" cy="40" rx="4" ry="2" fill="#f285b5" opacity="0.4" />

      {/* Thought bubble */}
      <motion.g
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <circle cx="85" cy="15" r="3" fill="#f2d9bc" />
        <circle cx="90" cy="8" r="4" fill="#f2d9bc" />
        <circle cx="82" cy="5" r="6" fill="#f2d9bc" />
        <text x="78" y="8" fontSize="8">?</text>
      </motion.g>

      {/* Paw on chin */}
      <ellipse cx="70" cy="52" rx="8" ry="6" fill="#85462a" transform="rotate(20 70 52)" />
    </motion.svg>
  )
}
