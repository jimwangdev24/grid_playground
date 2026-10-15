import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { userPresetsPlugin } from './server/userPresetsPlugin.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), userPresetsPlugin()],
})
