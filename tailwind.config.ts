import type { Config } from 'tailwindcss';

// Paleta tirada do logo e do Instagram da Shine Factory (círculo cinza-bege, tons de creme e dourado das peças).
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2a2420',
        taupe: { DEFAULT: '#7f756b', dark: '#5f564e', light: '#d8cfc3' },
        cream: '#f6f1ea',
        sand: '#ebe3d8',
        champagne: '#b8995e',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        script: ['Allura', '"Snell Roundhand"', 'cursive'],
      },
    },
  },
  plugins: [],
};
export default config;
