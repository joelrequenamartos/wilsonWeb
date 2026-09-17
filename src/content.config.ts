import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const tours = defineCollection({
  loader: file('src/data/tours.json'),
  schema: z.object({
    id: z.string(),
    order: z.number(),
    name: z.string(),
    shortName: z.string(),
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
      places: z.array(z.object({ name: z.string(), description: z.string() })),
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
  loader: file('src/data/reviews.json'),
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

export const collections = { tours, restaurants, places, reviews };
