import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D1117", // Deep obsidian dark grey
        foreground: "#F3F4F6", // Platinum light grey
        card: {
          DEFAULT: "#161B22", // Premium charcoal slate
          hover: "#1F242C",
          foreground: "#F9FAFB",
        },
        border: "#30363D", // Refined metallic grey border
        muted: {
          DEFAULT: "#21262D",
          foreground: "#8B949E",
        },
        primary: {
          DEFAULT: "#DC2626", // Energetic Crimson Red
          hover: "#B91C1C",   // Deep Ruby Red
          dark: "#991B1B",
          light: "#EF4444",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#4B5563", // Industrial Slate Grey
          hover: "#374151",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#D97706",
          foreground: "#FFFFFF",
        },
        danger: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};

export default config;
