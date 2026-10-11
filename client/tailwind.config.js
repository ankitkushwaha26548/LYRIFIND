/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class', // dark mode is toggled by adding the "dark" class to <html>
  theme: {
    extend: {
      colors: {
        brand: { 50: '#f1edff', 100: '#e4dcff', 500: '#6c4cf1', 600: '#5a3ad8', 700: '#4a2eb5' },
      },
    },
  },
  plugins: [],
};
