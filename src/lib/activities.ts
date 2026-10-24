import { SUPABASE_URL, SUPABASE_KEY } from './supabase';

export type Activity = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  gallery: string[];      // fotos extra del carrusel de la ventana (sin la portada)
  tag: string;
  highlight: string;
  free: boolean;
  price: number | null;
  oldPrice: number | null;
  priceFrom: boolean;
  currency: string;
  link: string;
};

// Solo enlaces http(s)
const safeUrl = (u: unknown) => {
  const v = String(u ?? '').trim();
  return /^https?:\/\/\S+$/i.test(v) ? v : '';
};
const num = (v: unknown) => (v === null || v === undefined || v === '' || !isFinite(Number(v)) ? null : Number(v));

// «41,82 €» / «25 $» (sin decimales si es entero)
export function formatPrice(n: number, currency = '$') {
  const txt = new Intl.NumberFormat('es-ES', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n);
  return `${txt} ${currency}`;
}

let cache: { at: number; value: Promise<Activity[]> } | null = null;

// Actividades publicadas, en el orden del panel. Se leen de Supabase al compilar la web;
// si Supabase falla o la tabla aún no existe, la página sale vacía (con un mensaje), sin romper la web.
async function load(): Promise<Activity[]> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/activities?select=*&published=eq.true&order=position.asc.nullslast,created_at.desc`;
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY } });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    const rows = await res.json();
    if (!Array.isArray(rows)) throw new Error('respuesta inesperada de Supabase');
    return rows
      .map((r: any) => ({
        id: String(r.id),
        title: String(r.title ?? '').trim(),
        description: String(r.description ?? '').trim(),
        image: safeUrl(r.image) || null,
        gallery: (Array.isArray(r.gallery) ? r.gallery : []).map(safeUrl).filter(Boolean).slice(0, 20),
        tag: String(r.tag ?? '').trim(),
        highlight: String(r.highlight ?? '').trim(),
        free: !!r.free,
        price: num(r.price),
        oldPrice: num(r.old_price),
        priceFrom: r.price_from !== false,
        currency: r.currency === '€' ? '€' : '$',
        link: safeUrl(r.link)
      }))
      .filter((a) => a.title && a.link);
  } catch (err) {
    console.warn('[actividades] No se pudo leer Supabase; la página sale vacía.', err);
    return [];
  }
}

export function getActivities(): Promise<Activity[]> {
  if (!cache || Date.now() - cache.at > 15000) cache = { at: Date.now(), value: load() };
  return cache.value;
}
