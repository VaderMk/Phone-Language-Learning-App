/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'der': '#3b82f6', // blue-500
        'die': '#ef4444', // red-500
        'das': '#22c55e', // green-500
      }
    },
  },
  plugins: [],
}
