import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#02080C",
          secondary: "#06131B",
          elevated: "#0A1821",
        },
        text: {
          primary: "#F3F7F8",
          secondary: "#8899A3",
        },
        accent: {
          DEFAULT: "#19C5F4",
          dark: "#0B8FB7",
        },
      },
      fontFamily: {
        heading: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      maxWidth: {
        content: "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
