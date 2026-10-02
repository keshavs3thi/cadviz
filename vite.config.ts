import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative asset paths work on GitHub Pages project sites and standard static hosts.
  base: './',
  plugins: [react()],
})
