/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Example primary palette for manga site (modern dark layout)
        brand: {
          dark: '#0f0f11',
          card: '#18181c',
          primary: '#e11d48', // Crimson/rose primary accent
          secondary: '#f43f5e',
          text: '#f3f4f6',
          muted: '#9ca3af',
        }
      }
    },
  },
  plugins: [],
}
