// Función de Vercel: recibe el formulario de contacto y envía el correo con Resend.
// Variables de entorno (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY  clave de Resend (obligatoria)
//   CONTACT_TO      destinatario (opcional, por defecto silvertoursny@gmail.com)
//   CONTACT_FROM    remitente (opcional, por defecto onboarding@resend.dev)
import { createHmac, timingSafeEqual } from 'node:crypto';

const ORANGE = '#E07A3E';
const MIN_AGE_MS = 3000; // un humano tarda más de 3 s en rellenar el formulario
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // el token caduca a las 2 h

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Asunto único por mensaje para que Gmail no los junte en un solo hilo:
// «CONSULTA WEB de: María López #1007-1832» (mes y día – hora y minutos, hora de Nueva York).
function asunto(nombre) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  const limpio = nombre.replace(/[\r\n]+/g, ' ').slice(0, 30).trim();
  return `CONSULTA WEB de: ${limpio} #${partes.month}${partes.day}-${partes.hour}${partes.minute}`;
}

// Solo aceptamos envíos que vengan de nuestra propia web (o de sus despliegues de prueba / local).
function originPermitido(req) {
  const origen = req.headers.origin || req.headers.referer || '';
  let host = '';
  try { host = new URL(origen).hostname; } catch { return false; }
  return (
    host === 'silvertoursny.com' || host.endsWith('.silvertoursny.com') ||
    host.endsWith('.vercel.app') || host === 'localhost' || host === '127.0.0.1'
  );
}

// Token firmado con la hora a la que se cargó el formulario: no se puede falsificar sin la clave.
const firmar = (ts, secret) => createHmac('sha256', secret).update(String(ts)).digest('hex');

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

export default async function handler(req, res) {
  const secret = process.env.RESEND_API_KEY;

  // GET: entrega un token con la hora actual; el formulario lo pide al cargarse.
  if (req.method === 'GET') {
    if (!secret) return res.status(500).json({ ok: false, error: 'not-configured' });
    const ts = Date.now();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, token: `${ts}.${firmar(ts, secret)}` });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false });
  }

  if (!originPermitido(req)) return res.status(403).json({ ok: false, error: 'origin' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Anti-spam: el campo «web» está oculto; si viene relleno es un robot.
  if (body.web) return res.status(200).json({ ok: true });

  const nombre = String(body.nombre || '').trim().slice(0, 120);
  const correo = String(body.correo || '').trim().slice(0, 200);
  const mensaje = String(body.mensaje || '').trim().slice(0, 5000);
  if (!nombre || !mensaje || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ ok: false, error: 'invalid' });
  }

  const key = secret;
  if (!key) return res.status(500).json({ ok: false, error: 'not-configured' });

  const fallo = tokenValido(body.token, key);
  if (fallo) return res.status(400).json({ ok: false, error: fallo });

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:1.6;color:#222;">
  <p style="margin:0 0 18px;">${esc(nombre)} con el mail <a href="mailto:${esc(correo)}" style="color:${ORANGE};">${esc(correo)}</a> te ha enviado el siguiente mensaje:</p>
  <div style="border:2px solid ${ORANGE};border-radius:10px;overflow:hidden;">
    <div style="background:${ORANGE};color:#ffffff;font-weight:bold;font-size:18px;padding:12px 18px;">Mensaje</div>
    <div style="padding:18px;font-size:18px;white-space:pre-wrap;">${esc(mensaje)}</div>
  </div>
</div>`;
  const text = `${nombre} con el mail ${correo} te ha enviado el siguiente mensaje:\n\nMensaje:\n${mensaje}`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || 'Silver Tours NY <onboarding@resend.dev>',
        to: [process.env.CONTACT_TO || 'silvertoursny@gmail.com'],
        reply_to: correo, // «Responder» contesta directamente al usuario
        subject: asunto(nombre),
        html,
        text
      })
    });
    if (!r.ok) {
      const detail = await r.json().catch(() => ({}));
      console.error('Resend rechazó el envío', r.status, detail);
      // 403 sin dominio verificado: Resend solo deja enviar al correo con el que se creó la cuenta.
      const code = r.status === 403 ? 'resend-destinatario' : r.status === 401 ? 'resend-clave' : `resend-${r.status}`;
      return res.status(502).json({ ok: false, error: code, detail: detail.message || '' });
    }
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: 'send-failed' });
  }
}
