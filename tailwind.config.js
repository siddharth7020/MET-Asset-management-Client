/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navbar: '#123458',
        background: '#F1EFEC',
        sidebar:"#D4C9BE"
      },
    },
  },
  plugins: [],
}