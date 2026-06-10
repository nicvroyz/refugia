import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './core/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand — warm lavender
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Warm cream — backgrounds
        cream: {
          50:  '#fffdf9',
          100: '#fffbf5',
          200: '#fef7ec',
          300: '#fdf0d5',
          400: '#fbe8b8',
        },
        // Trust green
        trust: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        // Warm amber — ratings, urgency
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Soft blues — sections
        sky: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        // Neutral warm grays
        warm: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(120, 113, 108, 0.1), 0 1px 2px -1px rgba(120, 113, 108, 0.08)',
        'warm':    '0 4px 6px -1px rgba(120, 113, 108, 0.1), 0 2px 4px -2px rgba(120, 113, 108, 0.08)',
        'warm-md': '0 10px 15px -3px rgba(120, 113, 108, 0.1), 0 4px 6px -4px rgba(120, 113, 108, 0.08)',
        'warm-lg': '0 20px 25px -5px rgba(120, 113, 108, 0.12), 0 8px 10px -6px rgba(120, 113, 108, 0.08)',
        'brand':   '0 4px 14px 0 rgba(139, 92, 246, 0.25)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float:   { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #fffbf5 0%, #f5f3ff 50%, #eff6ff 100%)',
        'gradient-hero': 'linear-gradient(135deg, #fdf4e7 0%, #f5f3ff 40%, #eff6ff 100%)',
        'gradient-brand': 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
        'gradient-trust': 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
      },
    },
  },
  plugins: [],
}

export default config
