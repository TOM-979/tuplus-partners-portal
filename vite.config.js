import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import apiHandler from './api/[...route].js'

export default defineConfig({
  plugins: [react(), {
    name: 'tuplus-demo-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res) => {
        req.url = `/api${req.url}`
        await apiHandler(req, res)
      })
    },
  }],
})
