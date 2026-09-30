import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://wilson-web-two.vercel.app',
  trailingSlash: 'never',
  redirects: {
    '/tours/tour-privado-espanol': '/tours/la-media-maraton'
  },
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true }
  })
});
