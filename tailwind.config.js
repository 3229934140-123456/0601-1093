/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        rose: {
          gold: "#E8C4A0",
          light: "#F5E6E0",
        },
        ivory: {
          DEFAULT: "#FFFAF5",
          dark: "#F0E6DC",
        },
        champagne: {
          DEFAULT: "#C9A961",
          dark: "#A68B4A",
        },
        mint: {
          DEFAULT: "#D4E4DB",
          dark: "#A8C4B5",
        },
        night: {
          DEFAULT: "#1A2A4A",
          light: "#2A3F5F",
        },
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        body: ["'Noto Sans SC'", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(232, 196, 160, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(232, 196, 160, 0.8)" },
        },
      },
      boxShadow: {
        "soft": "0 4px 20px rgba(0, 0, 0, 0.08)",
        "elevated": "0 8px 30px rgba(0, 0, 0, 0.12)",
        "gold": "0 4px 20px rgba(232, 196, 160, 0.4)",
      },
    },
  },
  plugins: [],
};
