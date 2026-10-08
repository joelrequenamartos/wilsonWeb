import { getCollection } from 'astro:content';
import { SUPABASE_URL, SUPABASE_KEY } from './supabase';

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML
  author: string;
  image: string | null;
  featured: boolean;
  date: Date;
};

const toDate = (d: string) => new Date(`${d.slice(0, 10)}T12:00:00`);

// Entradas publicadas, de la más reciente a la más antigua.
// Se leen de Supabase al compilar la web; si Supabase no responde, se usan las de src/content/blog
// para que una caída nunca deje el blog vacío.
export async function getPosts(): Promise<Post[]> {
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/posts` +
      `?select=slug,title,excerpt,content,author,image,featured,published_at&published=eq.true&order=published_at.desc`;
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY } });
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
        date: p.data.date
      }))
      .sort((a, b) => b.date.valueOf() - a.date.valueOf());
  }
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
