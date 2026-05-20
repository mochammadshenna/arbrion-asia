import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Vercel injects VERCEL_URL (no protocol). Custom domain takes priority.
  const domain = env.VITE_OG_URL || 'https://arbrion-asia.vercel.app';
  const ogImage = env.VITE_OG_IMAGE || `${domain}/assets/about-factory.jpg`;
  const waNumber = env.VITE_WA_NUMBER || '6281316337729';

  return {
    plugins: [
      {
        name: 'inject-og-meta',
        transformIndexHtml(html) {
          return html
            .replace(/%VITE_OG_IMAGE%/g, ogImage)
            .replace(/%VITE_OG_URL%/g, domain)
            .replace(/%VITE_WA_NUMBER%/g, waNumber);
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
