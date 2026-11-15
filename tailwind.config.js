/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030814',
          900: '#071021',
          850: '#0b162c',
          800: '#0f1f3d',
          750: '#15294f',
          700: '#1b3464',
          600: '#264887',
        },
        radar: {
          green: '#3ddc97',
          emerald: '#10b981',
          cyan: '#35c4e0',
          sky: '#38bdf8',
          amber: '#ffbe3b',
          rose: '#ff5c77',
          purple: '#9d65ff',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(53, 196, 224, 0.25)',
        'glow-green': '0 0 20px -3px rgba(61, 220, 151, 0.25)',
        'glow-amber': '0 0 20px -3px rgba(255, 190, 59, 0.25)',
      },
    },
  },
  plugins: [],
};

