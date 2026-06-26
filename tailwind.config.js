/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        royal: {
          950: '#07091B',
          900: '#0B0D2C',
          850: '#10123A',
          800: '#141747',
          700: '#1E236D',
        },
        gold: {
          50: '#FFFDF0',
          100: '#FEF9C3',
          200: '#FDE047',
          300: '#FACC15',
          400: '#F59E0B',
          500: '#D4AF37',
          600: '#AA7C11',
          700: '#855E0B',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 3s infinite ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.5' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
          '100%': { transform: 'scale(0.95)', opacity: '0.5' },
        }
      }
    }
  },
  plugins: [],
}
