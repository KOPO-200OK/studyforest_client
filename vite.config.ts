import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: {
    port: 5173,
    proxy: {
      // 개발 중 /api 요청을 Spring Boot(8081)로 전달 → CORS 불필요
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/ws-studyspace': {
        target: 'ws://localhost:8081',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  // 통합 배포 시: 아래 outDir 주석을 풀어 Spring static으로 바로 빌드
  // build: { outDir: '../src/main/resources/static', emptyOutDir: true },
})
