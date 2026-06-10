import { getAdminStats } from '@/actions/admin'
import Link from 'next/link'

export default async function AdminHomePage() {
  const stats = await getAdminStats()

  const cards = [
    { label: 'Total usuarios',         value: stats.totalUsers,       icon: '👥', color: 'bg-violet-50 border-violet-200',  href: '/admin/users' },
    { label: 'Familias registradas',   value: stats.totalFamilies,    icon: '👨‍👩‍👧', color: 'bg-sky-50 border-sky-200',       href: '/admin/users?role=FAMILY' },
    { label: 'Niñeras registradas',    value: stats.totalNannies,     icon: '👩‍🍼', color: 'bg-pink-50 border-pink-200',     href: '/admin/users?role=NANNY' },
    { label: 'Niñeras por aprobar',    value: stats.pendingNannies,   icon: '⏳', color: 'bg-amber-50 border-amber-200',    href: '/admin/users?role=NANNY' },
    { label: 'Reservas pendientes',    value: stats.pendingBookings,  icon: '📋', color: 'bg-orange-50 border-orange-200',  href: '/admin/bookings' },
    { label: 'Reservas completadas',   value: stats.completedBookings,icon: '✅', color: 'bg-emerald-50 border-emerald-200',href: '/admin/bookings' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Panel de administración</h1>
        <p className="text-stone-500 mt-1 text-sm">Resumen general de la plataforma Refugia</p>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <div className={`card p-5 border ${c.color} cursor-pointer group hover:shadow-md transition-all duration-200`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{c.icon}</span>
                <span className="text-stone-400 group-hover:text-violet-600 transition-colors text-sm">→</span>
              </div>
              <div className="text-3xl font-bold text-stone-800">{c.value}</div>
              <div className="text-sm text-stone-500 mt-1">{c.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/admin/users" className="card p-5 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">👥</div>
            <div>
              <h3 className="font-bold text-stone-800 group-hover:text-violet-700 transition-colors">Gestionar usuarios</h3>
              <p className="text-stone-500 text-sm">Aprobar niñeras, bloquear cuentas</p>
            </div>
            <span className="ml-auto text-stone-400 group-hover:text-violet-600 transition-colors">→</span>
          </div>
        </Link>
        <Link href="/admin/bookings" className="card p-5 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📋</div>
            <div>
              <h3 className="font-bold text-stone-800 group-hover:text-violet-700 transition-colors">Ver reservas</h3>
              <p className="text-stone-500 text-sm">Monitorear todas las reservas</p>
            </div>
            <span className="ml-auto text-stone-400 group-hover:text-violet-600 transition-colors">→</span>
          </div>
        </Link>
      </div>

      {/* Platform health indicators */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-stone-800 mb-5">Indicadores de plataforma</h2>
        <div className="space-y-4">
          {[
            {
              label: 'Tasa de niñeras aprobadas',
              value: stats.totalNannies > 0
                ? Math.round(((stats.totalNannies - stats.pendingNannies) / stats.totalNannies) * 100)
                : 0,
              color: 'bg-emerald-500',
            },
            {
              label: 'Tasa de reservas completadas',
              value: (stats.pendingBookings + stats.completedBookings) > 0
                ? Math.round((stats.completedBookings / (stats.pendingBookings + stats.completedBookings)) * 100)
                : 0,
              color: 'bg-violet-500',
            },
          ].map((ind) => (
            <div key={ind.label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-stone-600">{ind.label}</span>
                <span className="font-bold text-stone-800">{ind.value}%</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${ind.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${ind.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
