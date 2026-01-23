import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2DD4BF",
          dark: "#14B8A6",
        },
        navy: {
          DEFAULT: "#1E3A5F",
          light: "#334155",
        },
        background: {
          DEFAULT: "#F8FAFC",
          dark: "#0F172A",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        gray: {
          100: "#F1F5F9",
          300: "#CBD5E1",
          500: "#64748B",
        },
      },
      fontFamily: {
        heading: ["var(--font-nunito)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
