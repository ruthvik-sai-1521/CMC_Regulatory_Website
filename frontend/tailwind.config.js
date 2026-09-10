/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1B2B",
          900: "#0B1420",
          800: "#0F1B2B",
          700: "#182A40",
        },
        paper: "#F6F4EF",
        teal: {
          DEFAULT: "#1C6E62",
          light: "#3AA391",
          dark: "#124F46",
        },
        amber: {
          DEFAULT: "#A9700F",
          light: "#C98A1D",
          dark: "#7A5209",
        },
        line: "#DAD5C8",
        slate: {
          DEFAULT: "#5B6472",
        },
      },
      fontFamily: {
        display: ["'Source Serif 4'", "Georgia", "serif"],
        body: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      maxWidth: {
        prose: "68ch",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "count-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "pulse-soft": "count-pulse 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
