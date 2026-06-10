import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getNannyDashboardData } from '@/actions/nanny'
import { StatusBadge } from '@/components/ui/Badges'

export const metadata = { title: 'Historial | Refugia' }

export default async function NannyHistoryPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'NANNY') redirect('/login')

  const data = await getNannyDashboardData()
  if (!data) redirect('/login')

  const completed = data.profile.bookings.filter((b) =>
    ['COMPLETED', 'REJECTED', 'CANCELLED', 'CANCELLED_LATE'].includes(b.status)
  )
  const totalEarned = data.completedBookings.reduce((sum, b) => sum + (b.totalAmount ?? 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Historial de servicios</h1>
          <p className="text-stone-500 text-sm mt-1">{completed.length} servicio{completed.length !== 1 ? 's' : ''} en total</p>
        </div>
        <div className="card px-6 py-3 text-right">
          <p className="text-xs text-stone-500 mb-1">Total ganado</p>
          <p className="text-2xl font-bold text-emerald-600">${Math.round(totalEarned).toLocaleString('es-CL')}</p>
        </div>
      </div>

      {completed.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-stone-700 mb-2">Sin historial aún</h2>
          <p className="text-stone-400">Aquí aparecerán tus servicios completados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {completed.map((b) => {
            const [sh, sm] = b.startTime.split(':').map(Number)
            const [eh, em] = b.endTime.split(':').map(Number)
            const hours = ((eh + em / 60) - (sh + sm / 60)).toFixed(1)

            return (
              <div key={b.id} className="card p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center text-lg flex-shrink-0">👨‍👩‍👧</div>
                    <div>
                      <p className="font-semibold text-stone-800">{b.family.name}</p>
                      <p className="text-xs text-stone-400">
                        {new Date(b.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 flex-[2] text-sm">
                    <div>
                      <p className="text-stone-400 text-xs mb-1">Horario</p>
                      <p className="text-stone-700 font-medium">{b.startTime} – {b.endTime}</p>
                      <p className="text-stone-400 text-xs">{hours}h</p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-xs mb-1">Ganado</p>
                      <p className="font-bold text-emerald-600">
                        {b.totalAmount && b.status === 'COMPLETED' ? `$${Math.round(b.totalAmount).toLocaleString('es-CL')}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-xs mb-1">Estado</p>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
