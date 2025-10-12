import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
       '/jekyll': {
            target: 'http://127.0.0.1:4000',
            changeOrigin: true,
            rewrite: path => path.replace(/^\/jekyll/, '') // remove /jekyll prefix
        } 
    }
  }
})