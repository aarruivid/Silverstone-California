/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: '#ffffff', 2: '#f1f5f9', 3: '#e2e8f0' },
        accent: { DEFAULT: '#6366f1', hover: '#818cf8', dim: 'rgba(99,102,241,0.12)' },
        status: { ok: '#22c55e', warn: '#f59e0b', error: '#ef4444', info: '#3b82f6' },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
