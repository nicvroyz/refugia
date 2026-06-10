import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getRecommendedNannies, getFamilyBookings } from '@/actions/family'
import NannyCard from '@/components/family/NannyCard'
import { StatusBadge } from '@/components/ui/Badges'
import { UrgentCTA } from '@/components/family/UrgentCTA'

export const metadata = { title: 'Inicio | Refugia' }

export default async function FamilyDashboard() {
  const session = await getSession()
  if (!session || session.user.role !== 'FAMILY') redirect('/login')

  const [recommended, activeBookings, profile] = await Promise.all([
    getRecommendedNannies(session.user.id),
    getFamilyBookings('PENDING'),
    prisma.familyProfile.findUnique({ where: { userId: session.user.id } }),
  ])

  const firstName = session.user.name?.split(' ')[0] ?? 'familia'
  const hour = new Date().getHours()
  const greeting = hour < 13 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Welcome hero — cálido, no técnico */}
      <div className="bg-gradient-hero rounded-3xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <p className="text-violet-500 text-sm font-medium mb-1">{greeting}, {firstName} 👋</p>
          <h1 className="text-2xl font-bold text-stone-800">¿Necesitas ayuda hoy?</h1>
          <p className="text-stone-500 mt-1 text-sm">
            {profile?.commune
              ? `Niñeras de confianza cerca de ${profile.commune}`
              : 'Niñeras verificadas en Concepción y alrededores'}
          </p>
        </div>
        <Link href="/family/nannies" className="btn-primary btn-lg shadow-brand whitespace-nowrap">
          Ver niñeras disponibles →
        </Link>
      </div>

      {/* Urgente + favoritas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UrgentCTA />
        <Link
          href="/family/favorites"
          className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-violet-700 text-base bg-violet-50 border-2 border-violet-200 hover:bg-violet-100 transition-all duration-200 active:scale-[0.98]"
        >
          <span className="text-2xl">❤️</span>
          <div className="text-left">
            <div>Mis niñeras favoritas</div>
            <div className="text-violet-400 text-xs font-normal">Contacta a quien ya conoces</div>
          </div>
        </Link>
      </div>

      {/* Solicitudes activas */}
      {activeBookings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-800">Tus solicitudes activas</h2>
            <Link href="/family/bookings" className="text-sm text-violet-600 hover:text-violet-700 font-medium">Ver todas →</Link>
          </div>
          <div className="space-y-3">
            {activeBookings.slice(0, 3).map((b) => (
              <div key={b.id} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center text-lg flex-shrink-0">👩‍👧</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 truncate">{b.nannyProfile.user.name}</p>
                  <p className="text-sm text-stone-400">
                    {new Date(b.date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {' · '}{b.startTime}–{b.endTime}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Niñeras recomendadas */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-800">Niñeras recomendadas para ti</h2>
            <p className="text-xs text-stone-400 mt-0.5">Perfiles revisados · Disponibles en tu zona · Alta valoración</p>
          </div>
          <Link href="/family/nannies" className="text-sm text-violet-600 hover:text-violet-700 font-medium">Ver todas →</Link>
        </div>

        {recommended.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-stone-600">No encontramos niñeras disponibles en este momento</p>
            <p className="text-sm text-stone-400 mt-1">Prueba ampliando tu zona o revisa más tarde</p>
            <Link href="/family/nannies" className="btn-primary mt-4 inline-flex">Explorar todas</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommended.map((n) => (
              <NannyCard key={n.nannyProfileId} nanny={n} />
            ))}
          </div>
        )}
      </section>

      {/* Accesos rápidos */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: '/family/nannies',  icon: '🔍', label: 'Buscar niñeras' },
          { href: '/family/bookings', icon: '📅', label: 'Tus solicitudes' },
          { href: '/family/children', icon: '👶', label: 'Tus hijos' },
          { href: '/family/profile',  icon: '👤', label: 'Mi perfil' },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="card p-5 flex flex-col items-center gap-2 text-center hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
            <span className="text-2xl">{a.icon}</span>
            <span className="text-sm font-semibold text-stone-700">{a.label}</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
