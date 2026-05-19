import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/animejs')) return 'animejs';
          if (id.includes('node_modules/@fontsource')) return 'fonts';
        },
      },
    },
    chunkSizeWarningLimit: 700,
    cssCodeSplit: false,
  },
});
