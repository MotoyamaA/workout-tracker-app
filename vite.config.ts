import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 筋トレアプリ専用ポート（Viteデフォルト）
    host: true, // ネットワークアクセスを許可
    open: true, // ブラウザ自動起動
    strictPort: true, // ポートが使用中の場合エラーを出す
  },
  preview: {
    port: 4173, // プレビューポート
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})