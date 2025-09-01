/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        hinch: { 
          primary: "#F46300", 
          secondary: "#FF9B17", 
          accent: "#CC380A", 
          charcoal: "#414042" 
        }
      },
      borderRadius: { 
        "2xl": "1rem" 
      }
    },
  },
  plugins: [],
}
