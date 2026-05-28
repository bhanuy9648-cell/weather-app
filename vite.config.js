import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 3000,
    strictPort: true,
    open: !process.env.PORT && !process.env.VERCEL
  }
})
