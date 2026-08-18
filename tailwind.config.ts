import type { Config } from 'tailwindcss'

// Tailwind is used for LAYOUT AND SPACING ONLY.
// Typography and color live in CSS variables (see app/globals.css) per CLAUDE.md.
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
