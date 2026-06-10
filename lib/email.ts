/**
 * NannyConnect — Email Service
 *
 * Usa Resend (API HTTP) si RESEND_API_KEY está disponible.
 * En desarrollo (sin API key) hace console.log para no bloquear el flujo.
 *
 * Para producción:
 *   1. Crear cuenta en https://resend.com (free tier: 3.000 emails/mes)
 *   2. Agregar RESEND_API_KEY al .env de producción
 *   3. Agregar EMAIL_FROM con el dominio verificado (ej: "Refugia <no-reply@refugia.cl>")
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'Refugia <no-reply@refugia.cl>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// ─── Core sender ──────────────────────────────────────────────────────────────

async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    // Dev fallback — log to console
    console.log('\n📧 [EMAIL — sin RESEND_API_KEY, modo consola]')
    console.log(`  To:      ${to}`)
    console.log(`  Subject: ${subject}`)
    console.log(`  Body:    ${text || subject}\n`)
    return { success: true }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to,
        subject,
        html,
        text,
      }),
    })

    if (!res.ok) {
      const errorBody = await res.text()
      console.error('[email] Resend error:', res.status, errorBody)
      return { success: false, error: errorBody }
    }

    return { success: true }
  } catch (err: any) {
    console.error('[email] Fetch error:', err)
    return { success: false, error: err.message }
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

function baseTemplate(body: string): string {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#f8f7f4;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:32px 16px">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
          <!-- Header -->
          <tr><td style="background:linear-gradient(135deg,#5b21b6,#7c3aed);padding:28px 32px;text-align:center">
            <span style="font-size:28px">🏠</span>
            <h1 style="color:#fff;margin:8px 0 0;font-size:22px;font-weight:700">Refugia</h1>
            <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:13px">Niñeras de confianza para tu hogar</p>
          </td></tr>
          <!-- Body -->
          <tr><td style="padding:32px">
            ${body}
          </td></tr>
          <!-- Footer -->
          <tr><td style="background:#f8f7f4;padding:20px 32px;text-align:center">
            <p style="color:#9ca3af;font-size:12px;margin:0">© 2025 Refugia · Hecho con ❤️ en Chile</p>
            <p style="color:#9ca3af;font-size:12px;margin:4px 0 0">
              <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none">Ingresar a Refugia</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`
}

// ─── Public helpers ───────────────────────────────────────────────────────────

/**
 * Notifica a la niñera que tiene una nueva solicitud de reserva.
 */
export async function sendNewBookingEmail(
  to: string,
  nannyName: string,
  date: string,
  time: string
) {
  const subject = '¡Nueva solicitud de reserva en Refugia!'
  const body = `
    <h2 style="color:#1c1917;font-size:20px;margin:0 0 12px">Hola ${nannyName} 👋</h2>
    <p style="color:#57534e;font-size:15px;line-height:1.6">
      Tienes una nueva solicitud de cuidado para el <strong>${date}</strong> a las <strong>${time}</strong>.
    </p>
    <div style="background:#f5f3ff;border-radius:12px;padding:16px 20px;margin:20px 0;border-left:4px solid #7c3aed">
      <p style="color:#5b21b6;font-weight:600;margin:0">⏰ Responde pronto</p>
      <p style="color:#6d28d9;font-size:13px;margin:6px 0 0">Las familias valoran una respuesta rápida. Acepta o rechaza desde tu panel.</p>
    </div>
    <a href="${APP_URL}/nanny/requests"
       style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:8px">
      Ver solicitud →
    </a>`

  return sendEmail({ to, subject, html: baseTemplate(body), text: `Hola ${nannyName}, tienes una nueva solicitud para el ${date} a las ${time}. Ingresa a Refugia para responder.` })
}

/**
 * Notifica a la familia que la niñera aceptó su solicitud.
 */
export async function sendBookingAcceptedEmail(
  to: string,
  familyName: string,
  nannyName: string
) {
  const subject = `✅ ${nannyName} aceptó tu solicitud`
  const body = `
    <h2 style="color:#1c1917;font-size:20px;margin:0 0 12px">¡Buenas noticias, ${familyName}! 🎉</h2>
    <p style="color:#57534e;font-size:15px;line-height:1.6">
      <strong>${nannyName}</strong> ha aceptado tu solicitud de cuidado. Tu reserva está confirmada.
    </p>
    <div style="background:#f0fdf4;border-radius:12px;padding:16px 20px;margin:20px 0;border-left:4px solid #22c55e">
      <p style="color:#15803d;font-weight:600;margin:0">✅ Reserva confirmada</p>
      <p style="color:#16a34a;font-size:13px;margin:6px 0 0">Puedes ver los detalles y chatear con la niñera desde tu panel.</p>
    </div>
    <a href="${APP_URL}/family/bookings"
       style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:8px">
      Ver mis reservas →
    </a>`

  return sendEmail({ to, subject, html: baseTemplate(body), text: `Hola ${familyName}, ${nannyName} ha aceptado tu reserva. Ingresa a Refugia para ver los detalles.` })
}

/**
 * Notifica a un usuario que recibió un nuevo mensaje.
 */
export async function sendNewMessageEmail(
  to: string,
  userName: string,
  fromName: string
) {
  const subject = `💬 Nuevo mensaje de ${fromName}`
  const body = `
    <h2 style="color:#1c1917;font-size:20px;margin:0 0 12px">Hola ${userName} 👋</h2>
    <p style="color:#57534e;font-size:15px;line-height:1.6">
      Tienes un nuevo mensaje de <strong>${fromName}</strong> en Refugia.
    </p>
    <a href="${APP_URL}/family/messages"
       style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:16px">
      Ver mensaje →
    </a>`

  return sendEmail({ to, subject, html: baseTemplate(body), text: `Hola ${userName}, tienes un nuevo mensaje de ${fromName} en Refugia.` })
}
