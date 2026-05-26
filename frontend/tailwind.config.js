/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0A2342",
        secondary: "#D4AF37",
        wood: "#F5EBD9",
        "text-primary": "#333333",
        "text-secondary": "#777777",
        success: "#2ecc71",
        danger: "#e74c3c",
        warning: "#f39c12",
        info: "#3498db",
        dark: "#1a1a2e",
        "dark-light": "#16213e",
      },
    },
  },
  plugins: [],
};
