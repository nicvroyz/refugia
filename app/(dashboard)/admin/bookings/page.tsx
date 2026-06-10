import { getAdminBookings } from '@/actions/admin'
import { StatusBadge } from '@/components/ui/Badges'

export default async function AdminBookingsPage() {
  const bookings = await getAdminBookings()

  const byStatus = {
    PENDING_PAYMENT: bookings.filter((b) => b.status === 'PENDING_PAYMENT').length,
    REQUESTED: bookings.filter((b) => b.status === 'REQUESTED').length,
    IN_CHAT:   bookings.filter((b) => b.status === 'IN_CHAT').length,
    ACCEPTED:  bookings.filter((b) => b.status === 'ACCEPTED').length,
    COMPLETED: bookings.filter((b) => b.status === 'COMPLETED').length,
    REJECTED:  bookings.filter((b) => b.status === 'REJECTED').length,
    CANCELLED: bookings.filter((b) => ['CANCELLED', 'CANCELLED_LATE'].includes(b.status)).length,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Todas las reservas</h1>
        <p className="text-stone-500 mt-1 text-sm">{bookings.length} reserva{bookings.length !== 1 ? 's' : ''} en total</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(byStatus).map(([status, count]) => (
          <div key={status} className="card text-center py-4">
            <div className="text-2xl font-bold text-stone-800">{count}</div>
            <div className="mt-1"><StatusBadge status={status as any} /></div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
              <tr>
                <th className="px-6 py-4 font-medium">Familia</th>
                <th className="px-6 py-4 font-medium">Niñera</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Horario</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Creada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {bookings.map((b) => {
                const hours = (() => {
                  const [sh, sm] = b.startTime.split(':').map(Number)
                  const [eh, em] = b.endTime.split(':').map(Number)
                  return ((eh + em / 60) - (sh + sm / 60)).toFixed(1)
                })()

                return (
                  <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-800 text-sm">{b.family.name}</p>
                      <p className="text-xs text-stone-400">{b.family.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-stone-700">{b.nannyProfile.user.name}</p>
                    </td>
                    <td className="px-6 py-4 tabular-nums text-xs text-stone-600">
                      {new Date(b.date).toLocaleDateString('es-CL', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-xs tabular-nums">
                      <p className="text-stone-700">{b.startTime} – {b.endTime}</p>
                      <p className="text-stone-400">{hours}h</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-stone-800">
                        {b.totalAmount ? `$${Number(b.totalAmount).toLocaleString('es-CL')}` : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-400 tabular-nums">
                      {new Date(b.createdAt).toLocaleDateString('es-CL', {
                        day: '2-digit', month: 'short',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-stone-500">No hay reservas registradas aún.</p>
          </div>
        )}
      </div>
    </div>
  )
}
