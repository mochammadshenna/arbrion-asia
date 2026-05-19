import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Vercel injects VERCEL_URL (no protocol). Custom domain takes priority.
  const domain = 'https://arbrion-asia.vercel.app';

  const ogImage = `${domain}/assets/about-factory.jpg`;

  return {
    plugins: [
      {
        name: 'inject-og-meta',
        transformIndexHtml(html) {
          return html
            .replace(/%VITE_OG_IMAGE%/g, ogImage)
            .replace(/%VITE_OG_URL%/g, domain);
        },
      },
    ],
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
  };
});
