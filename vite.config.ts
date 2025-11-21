import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// USERNAME VE REPO ADINI DOLDUR
export default defineConfig({
  plugins: [react()],
  base: '/vibe-code-banker-game/', 
})