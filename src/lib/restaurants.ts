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
  adjust?: { logo?: ImgAdjust; banner?: ImgAdjust }; // zoom y posición de las imágenes
};

// Zoom (1 = tamaño normal) y desplazamiento en % del marco (x: derecha, y: abajo)
export type ImgAdjust = { z?: number; x?: number; y?: number; s?: number }; // s: intensidad de la sombra del logo (0-100)

const num = (v: unknown, d: number) => (typeof v === 'number' && isFinite(v) ? v : d);
// Estilo CSS de una imagen ajustada; vacío si está sin tocar
export function adjustStyle(a?: ImgAdjust | null): string | undefined {
  if (!a) return undefined;
  const z = num(a.z, 1), x = num(a.x, 0), y = num(a.y, 0);
  if (z === 1 && x === 0 && y === 0) return undefined;
  return `transform:translate(${x}%,${y}%) scale(${z})`;
}

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
        featuredRank: r.featured_rank ?? undefined,
        adjust: r.img_adjust && typeof r.img_adjust === 'object' ? r.img_adjust : undefined
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

export const DEFAULT_SHADOW = 40;
// Estilo del logo: zoom/posición + sombra suave (sigue la silueta del PNG, sin fondo blanco)
export function logoStyle(a?: ImgAdjust | null): string {
  const z = num(a?.z, 1), x = num(a?.x, 0), y = num(a?.y, 0), s = Math.min(100, Math.max(0, num(a?.s, DEFAULT_SHADOW)));
  const t = z === 1 && x === 0 && y === 0 ? '' : `transform:translate(${x}%,${y}%) scale(${z});`;
  const f = s === 0 ? '' : `filter:drop-shadow(0 ${(2 + s * 0.06).toFixed(1)}px ${(4 + s * 0.1).toFixed(1)}px rgba(0,0,0,${(s / 100 * 0.9).toFixed(2)}))`;
  return t + f;
}
