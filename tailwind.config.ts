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
        background: '#0f172a', // Slate 900 - modern dark blue-gray
        card: '#1e293b', // Slate 800 - lighter card background
        primary: '#38bdf8', // Sky 400 - light blue accent
        'primary-dark': '#0ea5e9', // Sky 500 - darker blue
        'status-free': '#22c55e', // Green 500 - modern green
        'status-occupied': '#ef4444', // Red 500 - vibrant red
        'status-reserved': '#f59e0b', // Amber 500 - warm amber
        'status-offline': '#64748b', // Slate 500 - modern gray
      },
    },
  },
  plugins: [],
}
export default config
