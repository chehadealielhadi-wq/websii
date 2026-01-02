/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D4A853',
          dark: '#B8923F',
          light: '#E5C17A',
        },
        dark: {
          DEFAULT: '#1A1A1A',
          lighter: '#2A2A2A',
          card: '#242424',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
