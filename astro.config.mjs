import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://wilson-web-two.vercel.app',
  trailingSlash: 'never',
  redirects: {
    '/tours/tour-privado-espanol': '/tours/la-media-maraton'
  }
});
