import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${path.resolve(import.meta.dirname, './src')}/` },
    ],
  },
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.perimatrik.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
