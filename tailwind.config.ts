import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Capybara-inspired earthy warm palette
        capy: {
          50: '#fdf8f3',
          100: '#f9ede0',
          200: '#f2d9bc',
          300: '#e9bf8f',
          400: '#dea05f',
          500: '#d4873f',
          600: '#c66f33',
          700: '#a5562c',
          800: '#85462a',
          900: '#6c3b25',
          950: '#3a1d12',
        },
        lagoon: {
          50: '#f0f9f6',
          100: '#dbf1e8',
          200: '#b9e3d4',
          300: '#8acdb9',
          400: '#58b199',
          500: '#38967d',
          600: '#2a7966',
          700: '#246153',
          800: '#214e44',
          900: '#1e413a',
          950: '#0d2521',
        },
        lily: {
          50: '#fdf4f8',
          100: '#fce8f2',
          200: '#fbd5e7',
          300: '#f8b4d3',
          400: '#f285b5',
          500: '#e85a95',
          600: '#d43a74',
          700: '#b82a5b',
          800: '#98264c',
          900: '#7f2442',
          950: '#4d0f23',
        },
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
        display: ['var(--font-fredoka)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'swim': 'swim 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'ripple': 'ripple 2s ease-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        swim: {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-8px) rotate(2deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
