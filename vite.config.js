/* import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
// */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Вернули импорт стилей!

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Вернули плагин Tailwind v4 в сборщик!
  ],
})
