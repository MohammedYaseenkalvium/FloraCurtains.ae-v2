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

          gold: "#C8A97E",

          surface: "#f8f5f2",
          "surface-highest": "#ffffff",

          footer: "#0F0C0B",

          muted: "#6B625A",
          border: "#D8C9BC",
        },
      },

      fontFamily: {
        sans: ["Inter", "Arial", "Helvetica", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
      },

      borderRadius: {
        flora: "0.75rem",
      },
    },
  },

  plugins: [],
};

export default config;