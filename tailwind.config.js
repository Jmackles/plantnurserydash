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
        'sage-dark': {
          50: '#2d332e',
          100: '#252a26',
          200: '#1e221f',
          300: '#171a18',
          400: '#101211',
          500: '#0a0b0a',
          600: '#040404',
          700: '#000000',
          800: '#000000',
          900: '#000000',
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
        'soft-pastel-green': 'rgb(236, 246, 234)',
        'very-light-green': 'rgb(235, 245, 233)',
        'pale-greenish-white': 'rgb(233, 243, 231)',
        'muted-sage-green': 'rgb(219, 228, 217)',
        'light-grayish-green': 'rgb(230, 239, 228)',
        'subtle-dusty-green': 'rgb(221, 230, 219)',
        'light-desaturated-green': 'rgb(216, 225, 214)',
        'soft-warm-gray': 'rgb(202, 210, 200)',
        'light-neutral-green': 'rgb(214, 223, 212)',
        'fresh-soft-green': 'rgb(202, 227, 196)',
      },
      animation: {
        'leaf-sway': 'leaf-sway 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-in forwards',
      },
      keyframes: {
        'leaf-sway': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [
    lineClamp,
  ],
};

export default config;
