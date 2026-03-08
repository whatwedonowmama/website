import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple:    '#5B3FA6',
          coral:     '#E8735A',
          gold:      '#F7D06E',
          navy:      '#1A1A2E',
          lavender:  '#EDE7F6',
          midpurple: '#7B5EA7',
          cream:     '#FFF9F5',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        script:  ['Dancing Script', 'cursive'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
