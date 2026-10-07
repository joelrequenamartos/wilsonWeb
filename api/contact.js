// Función de Vercel: recibe el formulario de contacto y envía el correo con Resend.
// Variables de entorno (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY  clave de Resend (obligatoria)
//   CONTACT_TO      destinatario (opcional, por defecto silvertoursny@gmail.com)
//   CONTACT_FROM    remitente (opcional, por defecto onboarding@resend.dev)
const ORANGE = '#E07A3E';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

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

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ ok: false, error: 'not-configured' });

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
        subject: 'CONSULTA WEB',
        html,
        text
      })
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: 'send-failed' });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: 'send-failed' });
  }
}
