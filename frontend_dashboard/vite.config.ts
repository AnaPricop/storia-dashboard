import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Adăugăm această secțiune de server
  server: {
    fs: {
      // Această opțiune dezactivează o verificare care cauzează eroarea
      // pe versiunile mai noi de Node.js.
      cachedChecks: false
    }
  }
})