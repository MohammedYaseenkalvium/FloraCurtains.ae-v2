import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        flora: {
          background: "#fff8f5",
          foreground: "#1e1b18",

          primary: "#5A0E12",
          "primary-hover": "#74171C",
          ink: "#3E080B",

          gold: "#C8A97E",
          sand: "#E8DED4",
          taupe: "#A99A8D",

          surface: "#f8f5f2",
          "surface-highest": "#ffffff",

          footer: "#0F0C0B",

          muted: "#6B625A",
          border: "#D8C9BC",

          // Semantic states (professional, restrained — see docs/design-system.md)
          success: "#0F6E56",
          "success-surface": "#EDF7F3",
          warning: "#854D0E",
          "warning-surface": "#FEF9E7",
          danger: "#991B1B",
          "danger-surface": "#FEF2F2",
          info: "#185FA5",
          "info-surface": "#EEF4FA",
        },
      },

      fontFamily: {
        sans: ["Inter", "Arial", "Helvetica", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
      },

      borderRadius: {
        flora: "0.75rem",
        "flora-sm": "0.5rem",
        "flora-md": "0.75rem",
        "flora-lg": "1rem",
        "flora-xl": "1.25rem",
      },

      boxShadow: {
        "flora-sm": "0 1px 2px rgba(30, 27, 24, 0.05)",
        "flora-md": "0 4px 16px rgba(30, 27, 24, 0.07)",
        "flora-lg": "0 12px 40px rgba(30, 27, 24, 0.12)",
      },
    },
  },

  plugins: [],
};

export default config;