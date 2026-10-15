// Función de Vercel: recibe la solicitud del formulario público /registro-restaurante,
// la guarda en Supabase (tabla restaurant_requests, queda «pendiente» para el panel) y avisa por correo con Resend.
// Variables de entorno: RESEND_API_KEY (obligatoria), CONTACT_TO y CONTACT_FROM (opcionales, como en api/contact.js).
import { createHmac, timingSafeEqual } from 'node:crypto';

const SUPABASE_URL = 'https://vnhgihgozpyalhvykjou.supabase.co';
const SUPABASE_KEY = 'sb_publishable_f1jNLvuZQfit0gt_oCoJxA_PptbZ21J';
const ORANGE = '#E07A3E';
const MIN_AGE_MS = 8000;               // rellenar el formulario lleva más que esto
const MAX_AGE_MS = 6 * 60 * 60 * 1000; // el token caduca a las 6 h

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function originPermitido(req) {
  const origen = req.headers.origin || req.headers.referer || '';
  let host = '';
  try { host = new URL(origen).hostname; } catch { return false; }
  return (
    host === 'silvertoursny.com' || host.endsWith('.silvertoursny.com') ||
    host.endsWith('.vercel.app') || host === 'localhost' || host === '127.0.0.1'
  );
}

const firmar = (ts, secret) => createHmac('sha256', secret + ':registro').update(String(ts)).digest('hex');

function tokenValido(token, secret) {
  const [ts, firma] = String(token || '').split('.');
  const edad = Date.now() - Number(ts);
  if (!ts || !firma || !Number.isFinite(edad)) return 'token';
  const esperada = Buffer.from(firmar(ts, secret));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return 'token';
  if (edad > MAX_AGE_MS) return 'token';
  if (edad < MIN_AGE_MS) return 'too-fast';
  return null;
}

// Solo http(s) y solo de nuestro almacenamiento para las imágenes
const urlWeb = (u) => { const v = String(u || '').trim().slice(0, 300); return /^https?:\/\/[^\s]+$/i.test(v) ? v : ''; };
const urlImg = (u) => { const v = String(u || '').trim(); return v.startsWith(`${SUPABASE_URL}/storage/v1/object/public/blog-images/solicitudes/`) && v.length <= 500 ? v : null; };

export default async function handler(req, res) {
  const key = process.env.RESEND_API_KEY;

  if (req.method === 'GET') {
    if (!key) return res.status(500).json({ ok: false, error: 'not-configured' });
    const ts = Date.now();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, token: `${ts}.${firmar(ts, key)}` });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false });
  }
  if (!originPermitido(req)) return res.status(403).json({ ok: false, error: 'origin' });

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};
  if (b.web) return res.status(200).json({ ok: true }); // campo trampa: es un robot
  if (!key) return res.status(500).json({ ok: false, error: 'not-configured' });
  const fallo = tokenValido(b.token, key);
  if (fallo) return res.status(400).json({ ok: false, error: fallo });

  const row = {
    name: String(b.name || '').trim().slice(0, 120),
    cuisine: String(b.cuisine || '').trim().slice(0, 80),
    neighborhood: String(b.neighborhood || '').trim().slice(0, 80),
    price: ['$', '$$', '$$$'].includes(b.price) ? b.price : '$$',
    note: String(b.note || '').trim().slice(0, 600),
    website: urlWeb(b.website),
    logo: urlImg(b.logo),
    photo: urlImg(b.photo),
    contact_name: String(b.contact_name || '').trim().slice(0, 120),
    contact_email: String(b.contact_email || '').trim().slice(0, 200),
    contact_phone: String(b.contact_phone || '').trim().slice(0, 60)
  };
  if (!row.name || !row.neighborhood || !row.note || !row.contact_name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.contact_email)) {
    return res.status(400).json({ ok: false, error: 'invalid' });
  }

  // 1) Guardar la solicitud (queda «pendiente» en el panel)
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/restaurant_requests`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row)
    });
    if (!r.ok) {
      console.error('Supabase rechazó la solicitud', r.status, await r.text().catch(() => ''));
      return res.status(502).json({ ok: false, error: r.status === 404 ? 'not-configured-db' : 'save-failed' });
    }
  } catch {
    return res.status(502).json({ ok: false, error: 'save-failed' });
  }

  // 2) Aviso por correo (si falla, la solicitud ya está guardada: no se le dice error al restaurante)
  const fila = (k, v) => v ? `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top;">${k}</td><td style="padding:6px 0;">${v}</td></tr>` : '';
  const link = (u, t) => u ? `<a href="${esc(u)}" style="color:${ORANGE};">${esc(t || u)}</a>` : '';
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#222;">
  <p style="margin:0 0 14px;">Nueva solicitud de restaurante. Está <b>pendiente</b> en el panel (Restaurantes → Solicitudes).</p>
  <table style="border-collapse:collapse;">
    ${fila('Nombre', `<b>${esc(row.name)}</b>`)}
    ${fila('Cocina', esc(row.cuisine))}
    ${fila('Barrio', esc(row.neighborhood))}
    ${fila('Precio', esc(row.price))}
    ${fila('Descripción', esc(row.note))}
    ${fila('Web', link(row.website))}
    ${fila('Logo', link(row.logo, 'ver logo'))}
    ${fila('Foto', link(row.photo, 'ver foto'))}
    ${fila('Contacto', `${esc(row.contact_name)} · <a href="mailto:${esc(row.contact_email)}" style="color:${ORANGE};">${esc(row.contact_email)}</a>${row.contact_phone ? ' · ' + esc(row.contact_phone) : ''}`)}
  </table>
</div>`;
  const text = `Nueva solicitud de restaurante (pendiente en el panel).\n\nNombre: ${row.name}\nCocina: ${row.cuisine}\nBarrio: ${row.neighborhood}\nPrecio: ${row.price}\nDescripción: ${row.note}\nWeb: ${row.website}\nLogo: ${row.logo || ''}\nFoto: ${row.photo || ''}\nContacto: ${row.contact_name} · ${row.contact_email} · ${row.contact_phone}`;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || 'Silver Tours NY <onboarding@resend.dev>',
        to: [process.env.CONTACT_TO || 'silvertoursny@gmail.com'],
        reply_to: row.contact_email,
        subject: `NUEVO RESTAURANTE: ${row.name.replace(/[\r\n]+/g, ' ').slice(0, 60)}`,
        html,
        text
      })
    });
    if (!r.ok) console.error('Resend rechazó el aviso', r.status, await r.json().catch(() => ({})));
  } catch (e) { console.error('Aviso por correo fallido', e); }

  return res.status(200).json({ ok: true });
}
