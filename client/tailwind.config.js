/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#050505',
          900: '#080808',
          850: '#0D0D0D',
          800: '#111111',
          750: '#171717',
          700: '#1C1C1C',
          600: '#242424',
          500: '#333333',
        },
        orange: {
          primary: '#FF6A00',
          bright: '#FF7A00',
          soft: '#FF8C42',
          glow: 'rgba(255, 106, 0, 0.15)',
        },
        neutralText: {
          primary: '#F5F5F5',
          secondary: '#A3A3A3',
          muted: '#737373',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          critical: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
