/**
 * NannyConnect — Notification System
 *
 * Usa Resend (via lib/email.ts) si RESEND_API_KEY está disponible.
 * En desarrollo (sin API key) hace console.log.
 */
import { sendEmail as _sendEmail } from './email'

// Re-exportamos para backward compat con código que usa sendNotification directamente
export interface NotificationPayload {
  to: string
  recipientName: string
  type: NotificationType
  data: Record<string, string | number>
}

export type NotificationType =
  | 'BOOKING_REQUEST_RECEIVED'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_REMINDER'
  | 'BOOKING_COMPLETED'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'Refugia <no-reply@refugia.cl>'

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
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log('\n📧 [NOTIFICATION MOCK — sin RESEND_API_KEY]')
    console.log(`  To:      ${to}`)
    console.log(`  Subject: ${subject}`)
    console.log(`  Body:    ${text || subject}\n`)
    return
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, html, text }),
    })
    if (!res.ok) {
      console.error('[notifications] Resend error:', res.status, await res.text())
    }
  } catch (err) {
    console.error('[notifications] Send error:', err)
  }
}

function baseTemplate(body: string): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f8f7f4;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:32px 16px">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
          <tr><td style="background:linear-gradient(135deg,#5b21b6,#7c3aed);padding:28px 32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">🏠 Refugia</h1>
          </td></tr>
          <tr><td style="padding:32px">${body}</td></tr>
          <tr><td style="background:#f8f7f4;padding:16px 32px;text-align:center">
            <p style="color:#9ca3af;font-size:12px;margin:0">© 2025 Refugia · 
              <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none">Ingresar</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

export async function notifyNannyNewRequest(opts: {
  nannyEmail: string
  nannyName: string
  familyName: string
  date: string
  startTime: string
  endTime: string
}) {
  const subject = `Nueva solicitud de ${opts.familyName}`
  const body = `
    <h2 style="color:#1c1917;margin:0 0 12px">Hola ${opts.nannyName} 👋</h2>
    <p style="color:#57534e;font-size:15px;line-height:1.6">
      <strong>${opts.familyName}</strong> te ha enviado una solicitud de cuidado para el 
      <strong>${opts.date}</strong> de <strong>${opts.startTime}</strong> a <strong>${opts.endTime}</strong>.
    </p>
    <a href="${APP_URL}/nanny/requests"
       style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:16px">
      Ver solicitud →
    </a>`
  return sendEmail({ to: opts.nannyEmail, subject, html: baseTemplate(body), text: `Hola ${opts.nannyName}, tienes una nueva solicitud de ${opts.familyName} para el ${opts.date}.` })
}

export async function notifyFamilyAccepted(opts: {
  familyEmail: string
  familyName: string
  nannyName: string
  date: string
  startTime: string
  endTime: string
}) {
  const subject = `✅ ${opts.nannyName} aceptó tu solicitud`
  const body = `
    <h2 style="color:#1c1917;margin:0 0 12px">¡Buenas noticias, ${opts.familyName}! 🎉</h2>
    <p style="color:#57534e;font-size:15px;line-height:1.6">
      <strong>${opts.nannyName}</strong> aceptó tu solicitud para el 
      <strong>${opts.date}</strong> de ${opts.startTime} a ${opts.endTime}.
    </p>
    <a href="${APP_URL}/family/bookings"
       style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:16px">
      Ver mis reservas →
    </a>`
  return sendEmail({ to: opts.familyEmail, subject, html: baseTemplate(body), text: `Hola ${opts.familyName}, ${opts.nannyName} aceptó tu solicitud para el ${opts.date}.` })
}

export async function notifyFamilyRejected(opts: {
  familyEmail: string
  familyName: string
  nannyName: string
  date: string
}) {
  const subject = `Tu solicitud del ${opts.date} no pudo ser atendida`
  const body = `
    <h2 style="color:#1c1917;margin:0 0 12px">Hola ${opts.familyName}</h2>
    <p style="color:#57534e;font-size:15px;line-height:1.6">
      <strong>${opts.nannyName}</strong> no puede atenderte el <strong>${opts.date}</strong>.
      Te recomendamos buscar otra niñera disponible.
    </p>
    <a href="${APP_URL}/family/nannies"
       style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:16px">
      Buscar niñeras →
    </a>`
  return sendEmail({ to: opts.familyEmail, subject, html: baseTemplate(body), text: `Hola ${opts.familyName}, ${opts.nannyName} no puede atenderte el ${opts.date}.` })
}

export async function notifyBookingReminder(opts: {
  email: string
  name: string
  date: string
  startTime: string
  endTime: string
  extraInfo?: string
}) {
  const subject = `⏰ Recordatorio: Mañana tienes un servicio`
  const body = `
    <h2 style="color:#1c1917;margin:0 0 12px">Recordatorio, ${opts.name} ⏰</h2>
    <p style="color:#57534e;font-size:15px;line-height:1.6">
      Mañana <strong>${opts.date}</strong> de <strong>${opts.startTime}</strong> a <strong>${opts.endTime}</strong>.
      ${opts.extraInfo ? `<br><em>${opts.extraInfo}</em>` : ''}
    </p>
    <a href="${APP_URL}"
       style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:16px">
      Ver detalles →
    </a>`
  return sendEmail({ to: opts.email, subject, html: baseTemplate(body), text: `Recordatorio: mañana ${opts.date} de ${opts.startTime} a ${opts.endTime}.` })
}

// Backward-compatible generic sender (usado por código legacy)
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  console.log('[notifications] sendNotification called — usar helpers específicos en nuevo código', payload.type)
}
