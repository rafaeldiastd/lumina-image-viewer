/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lumina-bg': '#0f172a',
        'lumina-card': '#1e293b',
        'lumina-accent': '#6366f1',
        'lumina-accent-hover': '#4f46e5',
        'lumina-text': '#f8fafc',
        'lumina-text-muted': '#94a3b8',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
