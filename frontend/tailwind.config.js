/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        card: "#12121e",
        primary: {
          DEFAULT: "#6366f1", // Indigo
          hover: "#4f46e5"
        },
        secondary: {
          DEFAULT: "#10b981", // Emerald
          hover: "#059669"
        },
        accent: {
          purple: "#d946ef", // Fuchsia
          cyan: "#06b6d4", // Cyan
          rose: "#f43f5e" // Rose
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glass-sm": "0 4px 16px 0 rgba(31, 38, 135, 0.25)",
      }
    },
  },
  plugins: [],
}
