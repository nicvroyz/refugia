import { getFamilyBookings } from '@/actions/family'
import { StatusBadge } from '@/components/ui/Badges'
import { Avatar } from '@/components/ui/Avatar'
import { CancelBookingButton } from '@/components/family/CancelBookingButton'
import { BookingTimeline } from '@/components/family/BookingTimeline'
import { BookingModal } from '@/components/family/BookingModal'
import Link from 'next/link'

export default async function FamilyBookingsPage() {
  const bookings = await getFamilyBookings()

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Mis solicitudes</h1>
          <p className="text-stone-500 mt-1">{bookings.length} solicitude{bookings.length !== 1 ? 's' : ''} en total</p>
        </div>
        <Link href="/family/nannies" className="btn-primary text-sm py-2.5 px-5">
          + Nueva solicitud
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">Sin solicitudes</h2>
          <p className="text-stone-500 mb-6">Aún no has enviado ninguna solicitud de cuidado.</p>
          <Link href="/family/nannies" className="btn-primary inline-flex">
            Buscar niñeras
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const hours = (() => {
              const [sh, sm] = b.startTime.split(':').map(Number)
              const [eh, em] = b.endTime.split(':').map(Number)
              return ((eh + em / 60) - (sh + sm / 60)).toFixed(1)
            })()

            return (
              <div key={b.id} className="card p-5 hover:shadow-md transition-all duration-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Nanny info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar
                      name={b.nannyProfile.user.name}
                      image={b.nannyProfile.photoUrl ?? b.nannyProfile.user.image}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-800 truncate">{b.nannyProfile.user.name}</p>
                      <p className="text-xs text-stone-400">{b.nannyProfile.commune}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm flex-[2]">
                    <div>
                      <p className="text-stone-400 text-xs mb-1">Fecha</p>
                      <p className="text-stone-800 font-medium">
                        {new Date(b.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-xs mb-1">Horario</p>
                      <p className="text-stone-800 font-medium">{b.startTime} – {b.endTime}</p>
                      <p className="text-stone-400 text-xs">{hours}h</p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-xs mb-1">Total</p>
                      <p className="text-stone-800 font-medium">
                        {b.totalAmount ? `$${Number(b.totalAmount).toLocaleString('es-CL')}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-xs mb-1">Estado</p>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 mt-5">
                  <Link
                    href="/family/messages"
                    className="btn-secondary bg-violet-50 text-violet-600 hover:bg-violet-100 border-transparent text-xs py-2 px-3"
                  >
                    💬 Mensajes
                  </Link>
                  <Link
                    href={`/family/nannies/${b.nannyProfileId}`}
                    className="btn-secondary text-xs py-2 px-3"
                  >
                    Perfil
                  </Link>
                  {['PENDING_PAYMENT', 'PENDING', 'REQUESTED', 'IN_CHAT', 'ACCEPTED'].includes(b.status) ? (
                    <CancelBookingButton bookingId={b.id} />
                  ) : null}
                  {b.status === 'COMPLETED' && (
                    <BookingModal 
                      nannyProfileId={b.nannyProfileId}
                      nannyName={b.nannyProfile.user.name}
                      buttonText="Solicitar nuevamente"
                      initialData={{
                        address: b.address,
                        serviceType: b.serviceType,
                        childrenCount: b.childrenCount
                      }}
                    />
                  )}
                </div>

                {/* Timeline */}
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <BookingTimeline currentStatus={b.status} />
                </div>

                {/* Comment */}
                {b.comment && (
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <p className="text-xs text-stone-400 mb-1">Tu comentario</p>
                    <p className="text-sm text-stone-600">{b.comment}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
