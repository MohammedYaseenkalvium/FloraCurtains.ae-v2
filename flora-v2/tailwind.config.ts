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
          // Surfaces — DESIGN.md Warm Ivory / Cream
          background: "#F8F5F2",
          foreground: "#1A1A1A",
          surface: "#F8F5F2",
          cream: "#EFE7DF",
          "surface-highest": "#FFFFFF",

          // Brand
          primary: "#5A0E12",
          "primary-hover": "#74171C",
          ink: "#3D080B",
          gold: "#C8A97E",

          // Neutrals
          sand: "#E8DED4",
          taupe: "#A99A8D",
          muted: "#6B625A",
          border: "#D8C9BC",
          footer: "#0F0C0B",

          // Semantic states (restrained — see DESIGN.md / MASTER.md)
          success: "#0F6E56",
          "success-surface": "#EDF7F3",
          warning: "#854D0E",
          "warning-surface": "#FEF9E7",
          danger: "#991B1B",
          "danger-surface": "#FEF2F2",
          info: "#185FA5",
          "info-surface": "#EEF4FA",

          // Exact-value tokens for class-string hex removal (D-04) — each value is a
          // byte-identical copy of the literal it replaces; additions only, never edits.
          "success-hover": "#0D5A45",
          "success-text": "#166534",
          "success-border": "#B7D8CC",
          "success-soft": "#ECFDF5",
          "success-soft-hover": "#D1FAE5",
          "success-surface-hover": "#E0F1EB",
          "info-soft": "#EFF6FF",
          "info-soft-hover": "#DBEAFE",
          "warning-border": "#E6D19B",
          "warning-hover": "#FDF3CF",
          "danger-hover": "#7f1d1d",
          "primary-deep": "#4a0c0f",
          "cream-hover": "#E7DDD3",
          "meta-text": "#8B8178",
          placeholder: "#A69A91",
          "disabled-text": "#B7ADA5",
          "disabled-text-light": "#C5B8AE",
          heading: "#2E2925",
          "scheduled-accent": "#9A3412",
          panel: "#FCFAF8",
          "hero-scrim": "#2A0E11",
          "hero-scrim-deep": "#1C0A0C",
        },
      },

      fontFamily: {
        sans: ["Inter", "Arial", "Helvetica", "sans-serif"],
        // Cormorant Garamond ships self-hosted via src/app/fonts.css (static @font-face, no build-time fetch);
        // Georgia remains the deliberate editorial fallback.
        display: ["Cormorant Garamond", "Georgia", "serif"],
      },

      // DESIGN.md §4 editorial spacing scale (Tailwind defaults cover all but 120)
      spacing: {
        18: "4.5rem",
        120: "30rem",
      },

      borderRadius: {
        flora: "0.75rem",
        "flora-sm": "0.5rem",
        "flora-md": "0.75rem",
        "flora-lg": "1rem",
        "flora-xl": "1.25rem",
      },

      boxShadow: {
        "flora-sm": "0 1px 2px rgba(26, 26, 26, 0.05)",
        "flora-md": "0 4px 16px rgba(26, 26, 26, 0.07)",
        "flora-lg": "0 12px 40px rgba(26, 26, 26, 0.12)",
      },

      letterSpacing: {
        eyebrow: "0.18em",
        editorial: "0.02em",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },

      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.4s ease both",
      },
    },
  },

  plugins: [],
};

export default config;
