import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sage: {
          100: '#f0f4f0',
          200: '#dbe5db',
          300: '#b8ccb8',
          400: '#95b395',
          500: '#729972',
          600: '#5b7b5b',
          700: '#445c44',
        },
        lavender: {
          100: '#f3f0f4',
          200: '#e7e0ec',
          300: '#d0c2dd',
          400: '#b9a4ce',
          500: '#a286bf',
          600: '#8268a1',
          700: '#614c83',
        },
        mint: {
          100: '#f0f7f4',
          200: '#dcefe6',
          300: '#b9dfd0',
          400: '#95cfba',
          500: '#72bfa3',
          600: '#5b9f86',
          700: '#447764',
        }
      }
    },
  },
  plugins: [],
};

export default config;
