import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import NannyBrowseClient from '@/components/family/NannyBrowseClient'
import { getRecommendedNannies } from '@/actions/family'

export const metadata = { title: 'Buscar Niñeras | Refugia' }

export default async function NannyBrowsePage() {
  const session = await getSession()
  if (!session || session.user.role !== 'FAMILY') redirect('/login')

  const profile = await prisma.familyProfile.findUnique({
    where: { userId: session.user.id },
  })

  // Initial nannies via matching
  const initialNannies = await getRecommendedNannies(session.user.id)

  let favoriteIds: string[] = []
  try { favoriteIds = JSON.parse(profile?.favoriteNannies ?? '[]') } catch {}

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-warm-800">Buscar niñeras</h1>
        <p className="text-warm-500 text-sm mt-1">
          Encuentra la niñera perfecta para tu familia. Resultados ordenados por compatibilidad.
        </p>
      </div>

      <NannyBrowseClient
        initialNannies={initialNannies}
        familyCommune={profile?.commune}
        familyLat={profile?.lat}
        familyLng={profile?.lng}
        favoriteIds={favoriteIds}
      />
    </div>
  )
}
