/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vibe-purple': '#8B5CF6',
        'vibe-blue': '#3B82F6',
        'vibe-green': '#10B981',
        'vibe-orange': '#F59E0B',
        'vibe-pink': '#EC4899',
        'dark-bg': '#0F0F23',
        'dark-surface': '#1A1A2E',
        'dark-border': '#2D2D44',
      },
      fontFamily: {
        'code': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #8B5CF6, 0 0 10px #8B5CF6' },
          '100%': { boxShadow: '0 0 10px #8B5CF6, 0 0 20px #8B5CF6, 0 0 30px #8B5CF6' },
        }
      }
    },
  },
  plugins: [],
}