import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path' // 'node:' префикс не обязателен, но ок

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),   // <-- вот это
    },
  },
  server: { port: 5173, host: true },
})
