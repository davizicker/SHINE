import type { Config } from 'tailwindcss';

// Cores provisórias: trocar pelos valores da identidade visual da Shine.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f1a17',
        gold: { DEFAULT: '#b8893b', dark: '#8f6a2a', light: '#e9d6a8' },
        cream: '#faf6f0',
        blush: '#f3e4de',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
