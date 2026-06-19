/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'layer-1': '#10b981',
        'layer-2': '#f59e0b',
        'layer-3': '#ef4444',
        'layer-4': '#7c3aed',
      },
    },
  },
  plugins: [],
}
