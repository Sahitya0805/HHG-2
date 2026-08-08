/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'goa-green': '#08733F',
        'goa-green-dark': '#005A35',
        'goa-green-light': '#0B9352',
        'hh-yellow': '#FFD400',
        'hh-yellow-hover': '#E6BE00',
        'hot-pink': '#FF087C',
        'hot-pink-hover': '#E00067',
        'cream': '#FFF9E7',
        'cream-card': '#FFFDF5',
        'cream-dark': '#F4ECCD',
      },
      fontFamily: {
        display: ['Syne', 'Playfair Display', 'serif'],
        serif: ['Instrument Serif', 'Playfair Display', 'serif'],
        mono: ['Space Mono', 'Courier Prime', 'monospace'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #000000',
        'neo-lg': '6px 6px 0px 0px #000000',
        'neo-pink': '4px 4px 0px 0px #FF087C',
        'neo-yellow': '4px 4px 0px 0px #FFD400',
        'glow-yellow': '0 0 25px rgba(255, 212, 0, 0.4)',
        'glow-pink': '0 0 25px rgba(255, 8, 124, 0.4)',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(2deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.03)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'float-slow': 'float-slow 5s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
      }
    },
  },
  plugins: [],
}
