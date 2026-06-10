import { getNannyById } from '@/actions/family'
import { notFound } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { BookingModal } from '@/components/family/BookingModal'
import { FavoriteButton } from '@/components/family/FavoriteButton'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves', FRIDAY: 'Viernes', SATURDAY: 'Sábado', SUNDAY: 'Domingo',
}

export default async function NannyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const nanny = await getNannyById(resolvedParams.id)
  if (!nanny) notFound()

  const session = await getSession()
  let isFavorite = false
  if (session?.user.role === 'FAMILY') {
    const favorite = await prisma.favoriteNanny.findUnique({
      where: {
        familyId_nannyProfileId: {
          familyId: session.user.id,
          nannyProfileId: nanny.id,
        },
      },
    })
    if (favorite) isFavorite = true
  }

  const reviews = nanny.bookings
    .filter((b) => b.review)
    .map((b) => b.review!)

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <Avatar name={nanny.user.name} image={nanny.photoUrl ?? nanny.user.image} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-stone-800">{nanny.user.name}</h1>
              {nanny.isApproved && (
                <span className="badge badge-verified">
                  ✓ Verificada
                </span>
              )}
              {session?.user.role === 'FAMILY' && (
                <FavoriteButton nannyProfileId={nanny.id} initialIsFavorite={isFavorite} />
              )}
            </div>
            <p className="text-stone-400 text-sm mb-4">{nanny.commune}</p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6">
              <div className="text-center">
                <div className="text-xl font-black text-violet-700">${Number(nanny.hourlyRate).toLocaleString('es-CL')}</div>
                <div className="text-xs text-stone-500">por hora</div>
              </div>
              <div className="w-px bg-stone-200" />
              <div className="text-center">
                <div className="text-xl font-black text-stone-800">{nanny.experienceYears}</div>
                <div className="text-xs text-stone-500">años exp.</div>
              </div>
              {avgRating && (
                <>
                  <div className="w-px bg-stone-200" />
                  <div className="text-center">
                    <div className="text-xl font-black text-amber-500">⭐ {avgRating}</div>
                    <div className="text-xs text-stone-500">{reviews.length} reseñas</div>
                  </div>
                </>
              )}
            </div>

            {/* Social Proof Badges */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-stone-100">
              {nanny.avgResponseTimeMins !== null && nanny.avgResponseTimeMins < 60 && (
                <span className="badge badge-verified bg-sky-50 text-sky-700 border-sky-200">⚡ Responde rápido</span>
              )}
              {nanny.acceptanceRate !== null && nanny.acceptanceRate >= 0.8 && (
                <span className="badge badge-verified bg-emerald-50 text-emerald-700 border-emerald-200">✨ Alta prob. respuesta</span>
              )}
              {nanny.totalFamiliesWorked > 0 && (
                <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded-full">🤝 {nanny.totalFamiliesWorked} familias</span>
              )}
              {nanny.totalRebookings > 0 && (
                <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded-full">🔄 {nanny.totalRebookings} recontratos</span>
              )}
            </div>
          </div>
          <BookingModal nannyProfileId={nanny.id} nannyName={nanny.user.name} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* About */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-stone-800 mb-4">Sobre mí</h2>
          <p className="text-stone-600 text-sm leading-relaxed">{nanny.bio || 'Sin descripción aún.'}</p>
          
          {nanny.skills && (() => {
            try {
              const skills: string[] = JSON.parse(nanny.skills)
              if (skills.length === 0) return null
              return (
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <p className="text-xs text-stone-400 mb-2 font-semibold uppercase tracking-wider">Habilidades y Tareas</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => (
                      <span key={s} className="skill-tag text-xs pointer-events-none">{s.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                </div>
              )
            } catch { return null }
          })()}

          {nanny.certifications && (
            <div className="mt-4 pt-4 border-t border-stone-100">
              <p className="text-xs text-stone-400 mb-2 font-semibold uppercase tracking-wider">Certificaciones</p>
              <p className="text-stone-700 text-sm">{nanny.certifications}</p>
            </div>
          )}
          {nanny.languages && (
            <div className="mt-4 pt-4 border-t border-stone-100">
              <p className="text-xs text-stone-400 mb-2 font-semibold uppercase tracking-wider">Idiomas</p>
              <p className="text-stone-700 text-sm">{nanny.languages}</p>
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-stone-800 mb-4">Disponibilidad semanal</h2>
          {nanny.availability.length === 0 ? (
            <p className="text-stone-400 text-sm">Sin disponibilidad registrada.</p>
          ) : (
            <div className="space-y-2">
              {nanny.availability.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-sm font-medium text-stone-700">{DAY_LABELS[a.dayOfWeek]}</span>
                  <span className="text-sm text-stone-500 tabular-nums">{a.startTime} – {a.endTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-stone-800 mb-5">Reseñas ({reviews.length})</h2>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={r.fromUser.name} image={r.fromUser.image} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-stone-800">{r.fromUser.name}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < r.rating ? 'text-amber-400' : 'text-stone-300'}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                {r.comment && <p className="text-sm text-stone-600 leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
