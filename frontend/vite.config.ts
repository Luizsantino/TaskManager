import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // acessa diretamente o backend sem passar pelo domínio HTTPS do cloud
        changeOrigin: true,
        secure: false, // ignora certificado SSL (ambiente local/dev)
        //rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
