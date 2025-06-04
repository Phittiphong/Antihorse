import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // ให้ฟังทุก IP
    port: 5173,       // พอร์ตถ้าต้องการกำหนด
    strictPort: true, // ไม่สุ่มพอร์ต ถ้าต้องการ
  },
})
