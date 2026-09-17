import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const tours = defineCollection({
  loader: file('src/data/tours.json'),
  schema: z.object({
    id: z.string(),
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
    mapPosition: z.object({ top: z.string(), left: z.string() }).optional()
  })
});

const restaurants = defineCollection({
  loader: file('src/data/restaurants.json'),
  schema: z.object({
    id: z.string(),
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
    name: z.string(),
    initial: z.string(),
    avatarColor: z.string(),
    source: z.string(),
    context: z.string(),
    quote: z.string()
  })
});

export const collections = { tours, restaurants, places, reviews };
