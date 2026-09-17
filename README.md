# Silver Tours NY — mockup

Mockup de landing page para reservas de tours en Nueva York, construido con [Astro](https://astro.build). Contenido dirigido por datos (`src/data/*.json`) y componentes reutilizables — nada de HTML repetido a mano.

## Desarrollo

```bash
npm install
npm run dev       # servidor local con recarga en caliente
npm run build     # genera el sitio estático en dist/
npm run preview   # sirve dist/ localmente, tal y como lo vería Netlify/Vercel
```

## Despliegue

Sitio 100% estático (sin backend: la reserva y el pago de los tours se hacen en páginas externas). Conecta el repositorio a **Netlify** o **Vercel** y desplegará solo — detectan Astro automáticamente, sin configuración adicional.

## Estructura

- `src/data/*.json` — tours, restaurantes, lugares de interés y reseñas. Añadir un restaurante nuevo es añadir una entrada al JSON, no tocar plantillas.
- `src/content.config.ts` — esquema tipado de esas colecciones.
- `src/components/` — un componente por sección/tarjeta.
- `src/styles/global.css` — estilos globales (tokens de color, tipografía, componentes).
- `public/script.js` — interactividad (menú móvil, filtros, carrusel de destacados, mapa).

## Pendiente

- **Portada**: ahora mismo lleva un degradado de color a modo de placeholder (`src/components/Hero.astro`). Sustituir por la foto real cuando esté decidida.
- **Reseñas**: las de `src/data/reviews.json` son de ejemplo. Pendiente sustituirlas por reseñas reales de TripAdvisor (el scraping automático está bloqueado por su protección anti-bot).
- **Ebook**: sección de venta pendiente de revisión de contenido.
- **Tours**: sección a mejorar en una siguiente pasada — es la sección principal, donde se inicia la reserva.
