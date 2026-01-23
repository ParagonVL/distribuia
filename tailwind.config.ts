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
          DEFAULT: "#14B8A6",
          light: "#2DD4BF",
          dark: "#0D9488",
        },
        secondary: {
          DEFAULT: "#F97316",
          light: "#FB923C",
          dark: "#EA580C",
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
      animation: {
        shimmer: "shimmer 2s linear infinite",
        pulse: "pulse 1s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
