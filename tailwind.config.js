/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        weaver: {
          50: '#e0f8f1',
          100: '#ccf2e5',
          200: '#bbf0e2',
          300: '#8be2cf',
          400: '#5acdb7',
          500: '#2fb39a',
          600: '#23937e',
          700: '#1b7463',
          800: '#1e685d',
          900: '#154c44',
        }
      }
    },
  },
  plugins: [],
};
