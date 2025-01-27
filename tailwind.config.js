import { Config } from 'tailwindcss';
import lineClamp from '@tailwindcss/line-clamp';

/** @type {Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    // Add other paths as needed
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f8faf8',
          100: '#f0f4f1',
          200: '#dce5dd',
          300: '#bcd0bf',
          400: '#9ab59e',
          500: '#779c7c',
          600: '#5c7d61',
          700: '#4a644d',
          800: '#3d513f',
          900: '#344435',
        },
        lavender: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      animation: {
        'leaf-sway': 'leaf-sway 3s ease-in-out infinite',
      },
      keyframes: {
        'leaf-sway': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [
    lineClamp,
  ],
};

export default config;
