import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getNannyDashboardData, respondToBooking, completeBooking } from '@/actions/nanny'
import { StatusBadge } from '@/components/ui/Badges'

export const metadata = { title: 'Solicitudes | Refugia' }

export default async function NannyRequestsPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'NANNY') redirect('/login')

  const data = await getNannyDashboardData()
  if (!data) redirect('/login')

  const bookings = data.profile.bookings.filter((b) => ['REQUESTED', 'IN_CHAT', 'ACCEPTED'].includes(b.status))
  const pending  = bookings.filter((b) => ['REQUESTED', 'IN_CHAT'].includes(b.status))
  const accepted = bookings.filter((b) => b.status === 'ACCEPTED')

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Solicitudes</h1>
        <p className="text-stone-500 text-sm mt-1">
          {pending.length} pendiente{pending.length !== 1 ? 's' : ''} · {accepted.length} aceptada{accepted.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Pending */}
      <section className="space-y-3">
        <h2 className="font-bold text-stone-700 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-amber-400 rounded-full inline-block" />
          Pendientes ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="card p-10 text-center text-stone-400">No tienes solicitudes pendientes.</div>
        ) : (
          pending.map((b) => (
            <div key={b.id} className="card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center text-lg">👨‍👩‍👧</div>
                  <div>
                    <p className="font-semibold text-stone-800">{b.family.name}</p>
                    <p className="text-xs text-stone-400">
                      {new Date(b.date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                      {' · '}{b.startTime}–{b.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action={async () => {
                    'use server'
                    await respondToBooking(b.id, 'REJECTED')
                  }}>
                    <button className="btn-secondary text-sm">Rechazar</button>
                  </form>
                  <form action={async () => {
                    'use server'
                    await respondToBooking(b.id, 'ACCEPTED')
                  }}>
                    <button className="btn-trust text-sm">✓ Aceptar</button>
                  </form>
                  <Link
                    href="/nanny/messages"
                    className="btn-secondary bg-violet-50 text-violet-600 hover:bg-violet-100 border-transparent text-sm"
                  >
                    💬 Chat
                  </Link>
                </div>
              </div>
              {b.isUrgent && <span className="badge-urgent">🚨 Solicitud urgente</span>}
              {b.comment && (
                <div className="bg-stone-50 rounded-2xl p-3 text-sm text-stone-600">
                  <span className="text-stone-400 text-xs block mb-1">Comentario</span>
                  {b.comment}
                </div>
              )}
              {b.totalAmount && (
                <p className="text-sm font-semibold text-emerald-600">
                  Tarifa estimada: ${Math.round(b.totalAmount).toLocaleString('es-CL')}
                </p>
              )}
            </div>
          ))
        )}
      </section>

      {/* Accepted */}
      <section className="space-y-3">
        <h2 className="font-bold text-stone-700 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full inline-block" />
          Aceptadas ({accepted.length})
        </h2>
        {accepted.length === 0 ? (
          <div className="card p-10 text-center text-stone-400">No tienes servicios aceptados actualmente.</div>
        ) : (
          accepted.map((b) => (
            <div key={b.id} className="card p-5 flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-lg">✅</div>
                <div>
                  <p className="font-semibold text-stone-800">{b.family.name}</p>
                  <p className="text-xs text-stone-400">
                    {new Date(b.date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {' · '}{b.startTime}–{b.endTime}
                  </p>
                  {b.totalAmount && (
                    <p className="text-xs text-emerald-600 font-semibold mt-0.5">${Math.round(b.totalAmount).toLocaleString('es-CL')}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <form action={async () => {
                  'use server'
                  await completeBooking(b.id)
                }}>
                  <button className="btn-primary text-sm">Marcar completada</button>
                </form>
                <Link
                  href="/nanny/messages"
                  className="btn-secondary bg-violet-50 text-violet-600 hover:bg-violet-100 border-transparent text-sm"
                >
                  💬 Chat
                </Link>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
