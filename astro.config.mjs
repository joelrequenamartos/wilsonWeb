import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.silvertoursny.com',
  trailingSlash: 'never',
  integrations: [
    // Solo estas páginas van al sitemap (el resto no se lista, pero Google puede indexarlas igualmente).
    sitemap({
      filter: (page) => ['/', '/ebook', '/sobre-wilson'].includes(new URL(page).pathname),
      customPages: ['https://www.silvertoursny.com/#tours']
    })
  ],
  redirects: {
    '/tours/tour-privado-espanol': '/tours/la-media-maraton'
  }
});
