/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        headerPurple: '#360949'
      },
      height: {
        'header': 'var(--header-height)'
      }
    },
  },
  plugins: [],
}

