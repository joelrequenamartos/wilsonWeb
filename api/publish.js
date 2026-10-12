// Función de Vercel: el panel del blog la llama al guardar o borrar una entrada.
// Comprueba que quien llama es el administrador de Supabase y, si lo es, lanza una reconstrucción
// de la web (Deploy Hook de Vercel), para que los cambios aparezcan en /blog en 1-2 minutos.
// Variable de entorno: DEPLOY_HOOK_URL (Vercel → Settings → Git → Deploy Hooks).
const SUPABASE_URL = 'https://vnhgihgozpyalhvykjou.supabase.co';
const SUPABASE_KEY = 'sb_publishable_f1jNLvuZQfit0gt_oCoJxA_PptbZ21J';

function originPermitido(req) {
  const origen = req.headers.origin || req.headers.referer || '';
  let host = '';
  try { host = new URL(origen).hostname; } catch { return false; }
  return (
    host === 'silvertoursny.com' || host.endsWith('.silvertoursny.com') ||
    host.endsWith('.vercel.app') || host === 'localhost' || host === '127.0.0.1'
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }
  if (!originPermitido(req)) return res.status(403).json({ ok: false, error: 'origin' });

  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ ok: false, error: 'no-auth' });

  // ¿Es el administrador? Se lo preguntamos a Supabase con la sesión de quien llama.
  let esAdmin = false;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: '{}'
    });
    esAdmin = r.ok && (await r.json()) === true;
  } catch { /* se queda en false */ }
  if (!esAdmin) return res.status(403).json({ ok: false, error: 'not-admin' });

  const hook = process.env.DEPLOY_HOOK_URL;
  if (!hook) return res.status(500).json({ ok: false, error: 'not-configured' });

  try {
    const r = await fetch(hook, { method: 'POST' });
    if (!r.ok) return res.status(502).json({ ok: false, error: `hook-${r.status}` });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: 'hook-failed' });
  }
}
