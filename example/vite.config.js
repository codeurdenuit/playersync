import { defineConfig } from 'vite';

export default defineConfig({
  root:'./client',
  mode:'development',
  build: {
    outDir: '../dist',
    rollupOptions: {
      output: {
        manualChunks: {}
      }
    }
  },
});
