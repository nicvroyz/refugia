import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getNannyDashboardData, addNannyBlock, removeNannyBlock, upsertAvailability, deleteAvailability } from '@/actions/nanny'

export const metadata = { title: 'Mi Agenda | Refugia' }

const DAYS = [
  { id: 'MONDAY',    label: 'Lunes' },
  { id: 'TUESDAY',   label: 'Martes' },
  { id: 'WEDNESDAY', label: 'Miércoles' },
  { id: 'THURSDAY',  label: 'Jueves' },
  { id: 'FRIDAY',    label: 'Viernes' },
  { id: 'SATURDAY',  label: 'Sábado' },
  { id: 'SUNDAY',    label: 'Domingo' },
]

export default async function NannyAgendaPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'NANNY') redirect('/login')

  const data = await getNannyDashboardData()
  if (!data) redirect('/login')

  const { profile } = data

  // Map availability by dayOfWeek for easy lookup
  const availMap = Object.fromEntries(
    profile.availability.map((a) => [a.dayOfWeek, a])
  )

  // Upcoming bookings (accepted, future)
  const upcoming = profile.bookings
    .filter((b) => b.status === 'ACCEPTED' && new Date(b.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Future blocks
  const blocks = profile.blocks.filter((bl) => new Date(bl.date) >= new Date())

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Mi agenda</h1>
        <p className="text-stone-500 text-sm mt-1">
          Gestiona tu disponibilidad semanal y bloquea horarios específicos.
        </p>
      </div>

      {/* ── Disponibilidad semanal ── */}
      <section className="card p-6 space-y-5">
        <h2 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-3">
          📅 Disponibilidad semanal
        </h2>
        <p className="text-sm text-stone-500">
          Configura los días y horarios en que estás disponible para trabajar.
        </p>

        <div className="space-y-3">
          {DAYS.map((day) => {
            const avail = availMap[day.id]
            return (
              <div key={day.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3 border-b border-stone-50 last:border-0">
                <div className="w-28 font-semibold text-stone-700 text-sm flex-shrink-0">{day.label}</div>

                {avail ? (
                  <div className="flex items-center gap-3 flex-1">
                    <span className="bg-violet-50 text-violet-700 border border-violet-200 rounded-xl px-3 py-1.5 text-sm font-medium">
                      {avail.startTime} – {avail.endTime}
                    </span>
                    <span className="text-emerald-600 text-xs font-semibold">✓ Disponible</span>
                    <form action={async () => {
                      'use server'
                      await deleteAvailability(day.id)
                    }}>
                      <button type="submit" className="text-xs text-stone-400 hover:text-red-500 transition-colors ml-2">
                        Quitar
                      </button>
                    </form>
                  </div>
                ) : (
                  <form
                    className="flex items-center gap-2 flex-1"
                    action={async (formData: FormData) => {
                      'use server'
                      const start = formData.get('startTime') as string
                      const end = formData.get('endTime') as string
                      if (start && end) await upsertAvailability(day.id, start, end)
                    }}
                  >
                    <input type="time" name="startTime" defaultValue="09:00"
                      className="input py-1.5 text-sm w-32" />
                    <span className="text-stone-400 text-sm">a</span>
                    <input type="time" name="endTime" defaultValue="18:00"
                      className="input py-1.5 text-sm w-32" />
                    <button type="submit" className="btn-primary text-xs px-3 py-1.5">
                      + Agregar
                    </button>
                    <span className="text-xs text-stone-400">No disponible</span>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Servicios confirmados ── */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-stone-800">
          ✅ Servicios confirmados ({upcoming.length})
        </h2>

        {upcoming.length === 0 ? (
          <div className="card p-10 text-center text-stone-400">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-medium text-stone-500">No tienes servicios confirmados próximos.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div key={b.id} className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-violet-700">
                      {new Date(b.date).toLocaleDateString('es-CL', { day: '2-digit' })}
                    </span>
                    <span className="text-[9px] text-violet-500 uppercase">
                      {new Date(b.date).toLocaleDateString('es-CL', { month: 'short' })}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">{b.family.name}</p>
                    <p className="text-sm text-stone-500">
                      {new Date(b.date).toLocaleDateString('es-CL', { weekday: 'long' })}
                      {' · '}{b.startTime}–{b.endTime}
                    </p>
                    {b.isUrgent && <span className="badge-urgent text-xs mt-0.5 inline-block">🚨 Urgente</span>}
                  </div>
                </div>
                {b.totalAmount && (
                  <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">
                    ${Math.round(b.totalAmount).toLocaleString('es-CL')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Bloqueos manuales ── */}
      <section className="card p-6 space-y-5">
        <h2 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-3">
          🚫 Bloquear horario específico
        </h2>
        <p className="text-sm text-stone-500">
          Bloquea un horario puntual (cita médica, vacaciones, etc.) para que no aparezca como disponible.
        </p>

        {/* Add block form */}
        <form
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
          action={async (formData: FormData) => {
            'use server'
            const date = formData.get('date') as string
            const startTime = formData.get('startTime') as string
            const endTime = formData.get('endTime') as string
            const reason = formData.get('reason') as string
            if (date && startTime && endTime) {
              await addNannyBlock({ date, startTime, endTime, reason: reason || undefined })
            }
          }}
        >
          <div>
            <label className="input-label">Fecha</label>
            <input type="date" name="date" className="input"
              min={new Date().toISOString().split('T')[0]} required />
          </div>
          <div>
            <label className="input-label">Inicio</label>
            <input type="time" name="startTime" className="input" defaultValue="09:00" required />
          </div>
          <div>
            <label className="input-label">Fin</label>
            <input type="time" name="endTime" className="input" defaultValue="12:00" required />
          </div>
          <div>
            <label className="input-label">Motivo (opcional)</label>
            <input type="text" name="reason" className="input" placeholder="Cita médica…" />
          </div>
          <div className="sm:col-span-4 flex justify-end">
            <button type="submit" className="btn-primary">🚫 Agregar bloqueo</button>
          </div>
        </form>

        {/* Existing blocks */}
        {blocks.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-stone-100">
            <p className="text-sm font-semibold text-stone-600 mb-3">Bloqueos activos</p>
            {blocks.map((bl) => (
              <div key={bl.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <div className="text-sm">
                  <span className="font-semibold text-stone-700">
                    {new Date(bl.date).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span className="text-stone-500 mx-2">·</span>
                  <span className="text-stone-600">{bl.startTime}–{bl.endTime}</span>
                  {bl.reason && <span className="text-stone-400 ml-2 text-xs">({bl.reason})</span>}
                </div>
                <form action={async () => {
                  'use server'
                  await removeNannyBlock(bl.id)
                }}>
                  <button type="submit" className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors">
                    Eliminar
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
