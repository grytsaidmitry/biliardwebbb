/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        white: 'rgb(var(--c-text) / <alpha-value>)',
        base: 'rgb(var(--c-bg-base) / <alpha-value>)',
        card: 'rgb(var(--c-bg-card) / <alpha-value>)',
        'green-400': 'rgb(var(--c-accent) / <alpha-value>)',
        'green-500': 'rgb(var(--c-accent) / <alpha-value>)',
        'cyan-400': 'rgb(var(--c-accent-2) / <alpha-value>)',
        'red-400': 'rgb(var(--c-busy) / <alpha-value>)',
        'red-500': 'rgb(var(--c-busy) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
