import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { readFile } from 'node:fs/promises';

const AVATAR_COLORS = ['var(--coral)', '#C25F26', 'var(--gold)', '#A8501E', '#B8672C', '#D98B3F'];

// Reseñas: si hay una clave de Google Places API configurada (GOOGLE_PLACES_API_KEY
// + GOOGLE_PLACE_ID como variables de entorno, p.ej. en Vercel), las trae en cada
// build directamente desde Google. Si no están configuradas, o la llamada falla,
// usa las de src/data/reviews.json tal cual — así nada se rompe hasta que se activen.
async function loadReviews() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (apiKey && placeId) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&language=es&key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url);
      const data = await res.json();
      const googleReviews = data?.result?.reviews;
      if (Array.isArray(googleReviews) && googleReviews.length > 0) {
        console.log(`[reviews] Usando ${googleReviews.length} reseñas reales de Google Places.`);
        return googleReviews.map((r: any, i: number) => ({
          id: `google-${i}`,
          order: i + 1,
          name: r.author_name ?? 'Cliente de Google',
          initial: (r.author_name ?? '?').trim().charAt(0).toUpperCase(),
          avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
          source: 'Google',
          context: 'Reseña verificada',
          quote: r.text ?? ''
        }));
      }
      console.warn('[reviews] La API de Google Places respondió sin reseñas; usando las locales.');
    } catch (err) {
      console.warn('[reviews] No se pudo contactar con Google Places; usando las locales.', err);
    }
  }

  const raw = await readFile(new URL('./data/reviews.json', import.meta.url), 'utf-8');
  return JSON.parse(raw);
}

const tours = defineCollection({
  loader: file('src/data/tours.json'),
  schema: z.object({
    id: z.string(),
    order: z.number(),
    name: z.string(),
    shortName: z.string(),
    cardEyebrow: z.string(),
    cardTitle: z.string(),
    category: z.enum(['sports', 'culture', 'custom', 'free']),
    categoryLabel: z.string(),
    premium: z.boolean().default(false),
    icon: z.string(),
    description: z.string(),
    duration: z.string(),
    location: z.string(),
    level: z.string(),
    levelIcon: z.string(),
    rating: z.number(),
    reviewCount: z.number(),
    price: z.string(),
    priceNote: z.string(),
    art: z.string(),
    mapPosition: z.object({ top: z.string(), left: z.string() }).optional(),
    coverImage: z.string().optional(),
    coverPosition: z.string().optional(),
    coverVideo: z.string().optional(),
    coverVideoPoster: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    detail: z.object({
      subtitle: z.string(),
      intro: z.string(),
      meetingPoint: z.string(),
      language: z.string(),
      priceDetail: z.string(),
      transport: z.string(),
      availability: z.string(),
      includes: z.array(z.string()),
      notIncludes: z.array(z.string()).optional(),
      places: z.array(z.object({ name: z.string(), description: z.string(), image: z.string().optional() })),
      faq: z.array(z.object({ q: z.string(), a: z.string() }))
    })
  })
});

const restaurants = defineCollection({
  loader: file('src/data/restaurants.json'),
  schema: z.object({
    id: z.string(),
    order: z.number(),
    name: z.string(),
    cuisine: z.string(),
    cuisineLabel: z.string(),
    neighborhood: z.string(),
    price: z.string(),
    rating: z.number(),
    note: z.string(),
    art: z.string(),
    featuredRank: z.number().optional(),
    mapPosition: z.object({ top: z.string(), left: z.string() }).optional()
  })
});

const places = defineCollection({
  loader: file('src/data/places.json'),
  schema: z.object({
    id: z.string(),
    order: z.number(),
    name: z.string(),
    description: z.string(),
    icon: z.string(),
    art: z.string(),
    tourLabel: z.string(),
    mapPosition: z.object({ top: z.string(), left: z.string() }).optional()
  })
});

const reviews = defineCollection({
  loader: loadReviews,
  schema: z.object({
    id: z.string(),
    order: z.number(),
    name: z.string(),
    initial: z.string(),
    avatarColor: z.string(),
    source: z.string(),
    context: z.string(),
    quote: z.string()
  })
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.coerce.date(),
    author: z.string().default('Wilson Silver'),
    readTime: z.string().default('4 min de lectura')
  })
});

export const collections = { tours, restaurants, places, reviews, blog };
