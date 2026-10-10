import { getCollection } from 'astro:content';
import { SUPABASE_URL, SUPABASE_KEY } from './supabase';

// Evento de la lista «Eventos mensuales» de una entrada (date: AAAA-MM-DD).
// endDate: fecha final si el evento dura varios días (rango); vacío si es un solo día.
export type MonthlyEvent = { date: string; endDate: string; title: string; subtitle: string; link: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML
  author: string;
  image: string | null;
  featured: boolean;
  monthlyEvents: boolean; // la entrada tiene activa la lista «Eventos mensuales»
  events: MonthlyEvent[];
  date: Date;
};

const toDate = (d: string) => new Date(`${d.slice(0, 10)}T12:00:00`);

// Solo enlaces http(s): evita «javascript:» y similares aunque alguien los guardara.
const safeUrl = (u: unknown) => {
  const v = String(u ?? '').trim();
  return /^https?:\/\//i.test(v) ? v : '';
};

const toEvents = (raw: unknown): MonthlyEvent[] =>
  (Array.isArray(raw) ? raw : [])
    .map((e: any) => ({
      date: String(e?.date ?? '').slice(0, 10),
      endDate: String(e?.end_date ?? '').slice(0, 10),
      title: String(e?.title ?? '').trim(),
      subtitle: String(e?.subtitle ?? '').trim(),
      link: safeUrl(e?.link)
    }))
    .map((e) => ({ ...e, endDate: /^\d{4}-\d{2}-\d{2}$/.test(e.endDate) && e.endDate > e.date ? e.endDate : '' }))
    .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.title)
    .sort((a, b) => a.date.localeCompare(b.date));

// Las páginas del blog piden las entradas varias veces durante una misma compilación: se guardan unos segundos.
let cache: { at: number; value: Promise<Post[]> } | null = null;

// Entradas publicadas, de la más reciente a la más antigua.
// Se leen de Supabase al compilar la web; si Supabase no responde, se usan las de src/content/blog
// para que una caída nunca deje el blog vacío.
async function loadPosts(): Promise<Post[]> {
  try {
    // Orden manual del panel (columna «position»). Si esa columna aún no existe en Supabase, se ordena por fecha.
    const base = `${SUPABASE_URL}/rest/v1/posts?select=*&published=eq.true`;
    let res = await fetch(`${base}&order=position.asc.nullslast,created_at.desc`, { headers: { apikey: SUPABASE_KEY } });
    if (res.status === 400) res = await fetch(`${base}&order=published_at.desc`, { headers: { apikey: SUPABASE_KEY } });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('sin entradas publicadas');
    return rows.map((r: any) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt ?? '',
      content: r.content ?? '',
      author: r.author ?? 'Wilson Silver',
      image: r.image ?? null,
      featured: !!r.featured,
      monthlyEvents: !!r.monthly_events,
      events: toEvents(r.events),
      date: toDate(r.published_at)
    }));
  } catch (err) {
    console.warn('[blog] No se pudo leer Supabase; usando las entradas locales.', err);
    const local = await getCollection('blog');
    return local
      .map((p) => ({
        slug: p.id,
        title: p.data.title,
        excerpt: p.data.excerpt,
        content: '',
        author: p.data.author,
        image: p.data.image ?? null,
        featured: false,
        monthlyEvents: false,
        events: [],
        date: p.data.date
      }))
      .sort((a, b) => b.date.valueOf() - a.date.valueOf());
  }
}

// Fecha para la insignia de un evento. Un día: «14» / «oct». Rango del mismo mes: «12-14» / «ago».
// Rango entre meses: «28-2» / «ago-sept».
const MES = new Intl.DateTimeFormat('es', { month: 'short' });
const DIA = new Intl.DateTimeFormat('es', { day: 'numeric' });
export function formatEventDate(date: string, end = '') {
  const a = new Date(`${date}T12:00:00`);
  const mon = (d: Date) => MES.format(d).replace('.', '');
  if (!end || end <= date) return { num: DIA.format(a), mon: mon(a), range: false };
  const b = new Date(`${end}T12:00:00`);
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  return { num: `${DIA.format(a)}-${DIA.format(b)}`, mon: sameMonth ? mon(a) : `${mon(a)}-${mon(b)}`, range: true };
}

export function getPosts(): Promise<Post[]> {
  if (!cache || Date.now() - cache.at > 15000) cache = { at: Date.now(), value: loadPosts() };
  return cache.value;
}

// Eventos de la entrada que tiene activos los «Eventos mensuales» (solo si está publicada), por fecha.
export async function getMonthlyEvents(): Promise<MonthlyEvent[]> {
  const posts = await getPosts();
  return posts
    .filter((p) => p.monthlyEvents)
    .flatMap((p) => p.events)
    .sort((a, b) => a.date.localeCompare(b.date));
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'seccion';

// Añade un id a cada título (h2/h3) del contenido y devuelve el índice «En este artículo».
export function prepareContent(rawHtml: string) {
  // El editor guarda los espacios como «&nbsp;» (espacio que no se parte): el texto no salta de línea y se sale de la pantalla.
  const html = rawHtml.replace(/&nbsp;|\u00a0/g, ' ');
  const toc: { id: string; title: string; level: 2 | 3 }[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_m, lvl, attrs, inner) => {
    const title = inner
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    let id = slugify(title);
    while (used.has(id)) id += '-2';
    used.add(id);
    toc.push({ id, title, level: Number(lvl) as 2 | 3 });
    return `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`;
  });
  return { html: out, toc };
}
