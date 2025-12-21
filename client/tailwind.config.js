/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          dark: "#1e1e1e",
          darker: "#18181b",
          accent: "#3b82f6",
        }
      },
    },
    plugins: [],
  }