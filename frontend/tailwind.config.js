/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crayon: {
          red: '#FF6B6B',
          blue: '#4ECDC4',
          yellow: '#FFD166',
          green: '#83D483',
          purple: '#9A7ECC',
          pink: '#FF90B3',
          orange: '#FF9F5A',
          background: '#FFFBE6',
          paper: '#FFFFF0'
        }
      },
      fontFamily: {
        crayon: ['Comic Sans MS', 'Comic Neue', 'cursive']
      },
      animation: {
        'pop-in': 'pop-in 0.4s ease-out forwards',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
      boxShadow: {
        'crayon': '3px 3px 0 rgba(0, 0, 0, 0.1)',
        'crayon-lg': '5px 5px 0 rgba(0, 0, 0, 0.1)'
      },
    },
  },
  plugins: [],
} 