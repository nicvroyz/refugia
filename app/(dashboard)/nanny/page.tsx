import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getNannyDashboardData } from '@/actions/nanny'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { StatusBadge } from '@/components/ui/Badges'

export const metadata = { title: 'Mi panel | Refugia' }

const LEVEL_LABEL: Record<string, string> = {
  BASIC: 'Básica', EXPERIENCED: 'Experimentada', PREMIUM: 'Premium',
}

export default async function NannyDashboard() {
  const session = await getSession()
  if (!session || session.user.role !== 'NANNY') redirect('/login')

  const data = await getNannyDashboardData()
  if (!data) redirect('/login')

  const { profile, totalEarned, pendingBookings, upcomingBookings, completedBookings } = data
  const name = session.user.name?.split(' ')[0] ?? 'Niñera'

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header card */}
      <div className="bg-gradient-hero rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-100 flex items-center justify-center text-4xl flex-shrink-0">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} className="w-full h-full object-cover rounded-3xl" alt={name} />
          ) : '👩‍👧'}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-warm-800">{session.user.name}</h1>
            <TrustBadge status={profile.trustStatus} source={profile.badgeSource} />
            <span className={`badge ${profile.level === 'PREMIUM' ? 'badge-premium' : profile.level === 'EXPERIENCED' ? 'badge-experienced' : 'badge-basic'}`}>
              {LEVEL_LABEL[profile.level] ?? profile.level}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-warm-500">
            <span>⭐ {profile.rating.toFixed(1)} ({profile.totalReviews} reseñas)</span>
            <span>📍 {profile.commune ?? 'Sin comuna'}</span>
            <span>🕐 {profile.experienceYears} año{profile.experienceYears !== 1 ? 's' : ''} de experiencia</span>
          </div>
          {!profile.isApproved && (
            <p className="text-amber-600 text-sm mt-2 font-medium">
              ⏳ Tu perfil está siendo revisado por nuestro equipo. Te avisaremos cuando esté listo para recibir solicitudes.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/nanny/profile" className="btn-secondary text-sm">Editar perfil</Link>
          <Link href="/nanny/agenda" className="btn-primary text-sm">Ver agenda</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: '⏳', label: 'Pendientes',   value: pendingBookings.length,  bg: 'bg-amber-50',   ico: 'bg-amber-100 text-amber-600' },
          { icon: '📅', label: 'Próximas',     value: upcomingBookings.length, bg: 'bg-sky-50',     ico: 'bg-sky-100 text-sky-600' },
          { icon: '✅', label: 'Completadas',  value: completedBookings.length, bg: 'bg-trust-50',  ico: 'bg-trust-100 text-trust-600' },
          { icon: '💰', label: 'Ganado',       value: `$${Math.round(totalEarned).toLocaleString('es-CL')}`, bg: 'bg-brand-50', ico: 'bg-brand-100 text-brand-600' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-3xl p-5 flex items-center gap-3 shadow-warm-sm`}>
            <div className={`w-10 h-10 ${s.ico} rounded-2xl flex items-center justify-center text-lg flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-warm-800">{s.value}</p>
              <p className="text-xs text-warm-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending bookings */}
      {pendingBookings.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-warm-800 mb-3">🔔 Familias interesadas en tu perfil</h2>
          <div className="space-y-3">
            {pendingBookings.map((b) => (
              <div key={b.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-warm-800">{b.family.name}</p>
                    {b.isUrgent && <span className="badge-urgent">🚨 Urgente</span>}
                  </div>
                  <p className="text-sm text-warm-500">
                    {new Date(b.date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {' · '}{b.startTime}–{b.endTime}
                  </p>
                  {b.finalRate && (
                    <p className="text-sm font-semibold text-trust-600 mt-1">${b.finalRate.toLocaleString('es-CL')}/hr</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <form action={async () => {
                    'use server'
                    const { respondToBooking } = await import('@/actions/nanny')
                    await respondToBooking(b.id, 'REJECTED')
                  }}>
                    <button className="btn-secondary text-sm">Rechazar</button>
                  </form>
                  <form action={async () => {
                    'use server'
                    const { respondToBooking } = await import('@/actions/nanny')
                    await respondToBooking(b.id, 'ACCEPTED')
                  }}>
                    <button className="btn-trust text-sm">✓ Aceptar</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick links */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: '/nanny/profile',   icon: '👤', label: 'Mi perfil' },
          { href: '/nanny/agenda',    icon: '📅', label: 'Mi agenda' },
          { href: '/nanny/requests',  icon: '📋', label: 'Solicitudes' },
          { href: '/nanny/history',   icon: '📊', label: 'Historial' },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="card-warm p-5 flex flex-col items-center gap-2 text-center hover:shadow-warm-md transition-all duration-200 hover:-translate-y-0.5">
            <span className="text-2xl">{a.icon}</span>
            <span className="text-sm font-semibold text-warm-700">{a.label}</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
