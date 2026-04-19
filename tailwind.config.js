/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#1a1714',
        surface:  '#252220',
        elevated: '#2e2b28',
        highest:  '#3a3530',
        border:   '#3a3530',
        accent:   '#d97757',
        'accent-dim': '#a85c3e',
        text:     '#f0ebe6',
        muted:    '#9c9289',
        success:  '#4caf82',
        warning:  '#e9c349',
        sidebar:  '#141210',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '10px',
        btn:  '6px',
      },
    },
  },
  plugins: [],
}
