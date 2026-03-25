/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#111111",
        border: "rgba(255,255,255,0.08)",
        muted: "#737373",
        primary: {
          DEFAULT: "#ff2e00",
          glow: "rgba(255, 46, 0, 0.35)",
        },
        accent: "#ff6b35",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 4px 24px rgba(0,0,0,0.45)",
        /** Elevación tipo dashboard / cards */
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.35)",
        /** Login / modales */
        lift: "0 0 0 1px rgba(255,46,0,0.1), 0 4px 6px rgba(0,0,0,0.2), 0 32px 64px rgba(0,0,0,0.55)",
        glow: "0 0 24px rgba(255, 46, 0, 0.15)",
      },
      backgroundImage: {
        "radial-fire":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,46,0,0.35) 0%, transparent 55%)",
        "gradient-accent": "linear-gradient(135deg, #ff2e00 0%, #ff6b35 100%)",
      },
    },
  },
  plugins: [],
};
