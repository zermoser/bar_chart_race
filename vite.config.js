import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/bar_chart_race/',
  plugins: [react()],
  server:{
    port: 3001
  }
})
