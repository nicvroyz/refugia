import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { BookingModal } from '@/components/family/BookingModal'

export const metadata = { title: 'Mis favoritas | Refugia' }

export default async function FavoritesPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'FAMILY') redirect('/login')

  const favorites = await prisma.favoriteNanny.findMany({
    where: { familyId: session.user.id },
    include: {
      nannyProfile: {
        include: {
          user: { select: { name: true, image: true } },
          _count: { select: { bookings: { where: { status: 'COMPLETED' } } } },
        },
      },
    },
  })

  const favoriteNannies = favorites.map(f => f.nannyProfile)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Mis niñeras favoritas</h1>
          <p className="text-stone-500 mt-1">
            {favoriteNannies.length} favorita{favoriteNannies.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/family/nannies" className="btn-primary text-sm">
          + Buscar niñeras
        </Link>
      </div>

      {favoriteNannies.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">Aún no tienes niñeras favoritas</h2>
          <p className="text-stone-500 mb-6 max-w-sm mx-auto">
            Guarda aquí a las cuidadoras con las que sientas mayor afinidad
            para contactarlas rápidamente cuando las necesites.
          </p>
          <Link href="/family/nannies" className="btn-primary inline-flex">
            Explorar niñeras
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favoriteNannies.map((nanny) => {
            const avgRating = nanny.rating ? Number(nanny.rating).toFixed(1) : null
            return (
              <div key={nanny.id} className="card p-5 flex flex-col gap-4">
                {/* Top: Avatar + info */}
                <div className="flex items-center gap-3">
                  <Avatar
                    name={nanny.user.name}
                    image={nanny.photoUrl ?? nanny.user.image}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 truncate">{nanny.user.name}</p>
                    <p className="text-xs text-stone-400">{nanny.commune ?? 'Sin comuna'}</p>
                  </div>
                  {nanny.isApproved && (
                    <span className="badge badge-verified text-xs">✓</span>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex gap-4 text-sm">
                  <div className="text-center flex-1">
                    <div className="font-bold text-violet-700">
                      ${Number(nanny.hourlyRate).toLocaleString('es-CL')}
                    </div>
                    <div className="text-xs text-stone-400">por hora</div>
                  </div>
                  <div className="w-px bg-stone-100" />
                  <div className="text-center flex-1">
                    <div className="font-bold text-stone-800">{nanny.experienceYears}</div>
                    <div className="text-xs text-stone-400">años exp.</div>
                  </div>
                  {avgRating && (
                    <>
                      <div className="w-px bg-stone-100" />
                      <div className="text-center flex-1">
                        <div className="font-bold text-amber-500">⭐ {avgRating}</div>
                        <div className="text-xs text-stone-400">rating</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/family/nannies/${nanny.id}`}
                    className="btn-secondary flex-1 text-sm text-center justify-center"
                  >
                    Ver perfil
                  </Link>
                  <BookingModal nannyProfileId={nanny.id} nannyName={nanny.user.name} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tip */}
      {favoriteNannies.length > 0 && (
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-violet-500 text-lg">💡</span>
          <p className="text-sm text-violet-700">
            Puedes agregar o quitar favoritas desde el perfil de cualquier niñera.
          </p>
        </div>
      )}
    </div>
  )
}
