/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3c72',
        'primary-light': '#2a5298',
        secondary: '#f8f9fa',
      }
    },
  },
  plugins: [],
}
