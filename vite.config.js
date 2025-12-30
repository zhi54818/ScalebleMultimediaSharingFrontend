import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8123',
        changeOrigin: true,
        // 后端已经配置了 context-path=/api，所以不需要去掉 /api 前缀
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})

