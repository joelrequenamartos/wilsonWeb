import { getCollection } from 'astro:content';
import { SUPABASE_URL, SUPABASE_KEY } from './supabase';

import { CUISINES } from './cuisines';
export { CUISINES };

export type Restaurant = {
  id: string;
  order: number;
  name: string;
  cuisine: string;
  cuisineLabel: string;
  neighborhood: string;
  price: string;
  note: string;
  art: string;
  logo: string | null;   // imagen subida desde el panel
  banner: string | null; // foto de comida subida desde el panel
  featuredRank?: number; // puesto (1-3) en el banner destacado de la home
};

// Misma forma que una entrada de colección, para que los componentes sigan usando restaurant.data.*
export type RestaurantEntry = { id: string; data: Restaurant };

let cache: { at: number; value: Promise<RestaurantEntry[]> } | null = null;

// Restaurantes visibles, en el orden elegido en el panel. Se leen de Supabase al compilar la web;
// si Supabase FALLA (o la tabla aún no existe), se usa src/data/restaurants.json.
async function load(): Promise<RestaurantEntry[]> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/restaurants?select=*&published=eq.true&order=position.asc.nullslast,created_at.asc`;
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY } });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    const rows = await res.json();
    if (!Array.isArray(rows)) throw new Error('respuesta inesperada de Supabase');
    return rows.map((r: any, i: number) => ({
      id: r.id,
      data: {
        id: r.id,
        order: i + 1,
        name: r.name,
        cuisine: r.cuisine,
        cuisineLabel: r.cuisine_label || CUISINES[r.cuisine] || '',
        neighborhood: r.neighborhood ?? '',
        price: r.price ?? '',
        note: r.note ?? '',
        art: r.art || 'art-food1',
        logo: r.logo || null,
        banner: r.banner || null,
        featuredRank: r.featured_rank ?? undefined
      }
    }));
  } catch (err) {
    console.warn('[restaurantes] No se pudo leer Supabase; usando src/data/restaurants.json.', err);
    const local = (await getCollection('restaurants')).sort((a, b) => a.data.order - b.data.order);
    return local.map((e) => ({ id: e.id, data: { ...e.data, logo: null, banner: null } }));
  }
}

export function getRestaurants(): Promise<RestaurantEntry[]> {
  if (!cache || Date.now() - cache.at > 15000) cache = { at: Date.now(), value: load() };
  return cache.value;
}
