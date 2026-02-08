/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#0f1115',
        surface: '#151922',
        card: '#1c212d',
        border: '#232938',
        accent: '#e6a34a',
        accentDark: '#a35c24',
        muted: '#97a0b5',
        positive: '#22c55e',
        warning: '#facc15',
        danger: '#ef4444',
      },
      boxShadow: {
        soft: '0 10px 40px rgba(0,0,0,0.35)',
      },
      fontFamily: {
        display: ['"Manrope"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
