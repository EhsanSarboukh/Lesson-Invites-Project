/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // This is the key change: scans everything inside the 'src' folder
    './pages/**/*.{js,ts,jsx,tsx}', // Keep this if you have a 'pages' folder outside 'src'
    './components/**/*.{js,ts,jsx,tsx}', // Keep this if you have a 'components' folder outside 'src'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};