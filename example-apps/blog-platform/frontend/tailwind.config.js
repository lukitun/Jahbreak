/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'ui-serif', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            lineHeight: '1.7',
            fontSize: '1.125rem',
            p: {
              marginTop: '1.5em',
              marginBottom: '1.5em',
            },
            h1: {
              fontSize: '2.5em',
              marginTop: '0',
              marginBottom: '1em',
              lineHeight: '1.2',
              fontWeight: '700',
            },
            h2: {
              fontSize: '2em',
              marginTop: '2em',
              marginBottom: '1em',
              lineHeight: '1.3',
              fontWeight: '600',
            },
            h3: {
              fontSize: '1.5em',
              marginTop: '1.6em',
              marginBottom: '0.8em',
              lineHeight: '1.4',
              fontWeight: '600',
            },
            code: {
              color: '#e53e3e',
              backgroundColor: '#f7fafc',
              padding: '0.25em 0.5em',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
              fontWeight: '500',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#1a202c',
              color: '#e2e8f0',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              overflow: 'auto',
              fontSize: '0.875em',
              lineHeight: '1.7',
            },
            'pre code': {
              color: 'inherit',
              backgroundColor: 'transparent',
              padding: '0',
              borderRadius: '0',
              fontSize: 'inherit',
            },
            blockquote: {
              borderLeftColor: '#3b82f6',
              borderLeftWidth: '4px',
              fontStyle: 'italic',
              color: '#4b5563',
              padding: '1rem 1.5rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0 0.5rem 0.5rem 0',
            },
            a: {
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            img: {
              borderRadius: '0.5rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            },
            table: {
              marginTop: '2em',
              marginBottom: '2em',
            },
            thead: {
              borderBottomWidth: '2px',
              borderBottomColor: '#e5e7eb',
            },
            'thead th': {
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              textAlign: 'left',
              fontWeight: '600',
              backgroundColor: '#f9fafb',
            },
            'tbody td': {
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              borderTopWidth: '1px',
              borderTopColor: '#e5e7eb',
            },
          },
        },
        lg: {
          css: {
            fontSize: '1.25rem',
            lineHeight: '1.8',
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};