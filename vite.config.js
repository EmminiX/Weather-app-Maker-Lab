import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5137,
    proxy: {
      '/api': {
        target: 'http://localhost:5137',
        changeOrigin: true
      }
    }
  },
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  publicDir: 'public',
  assetsInclude: ['**/*.mov', '**/*.mp4', '**/*.webm']
})