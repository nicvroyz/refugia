import { prisma } from '@/lib/prisma'
import { calculateDistanceScore } from './calculateDistanceScore'
import { calculateSkillMatch } from './calculateSkillMatch'
import { checkAvailability } from './checkAvailability'
import { calculateChildMatchScore, getChildMatchLabel, type ChildMatchInput } from './calculateChildMatchScore'

export interface MatchRequest {
  date: Date
  startTime: string
  endTime: string
  lat?: number | null
  lng?: number | null
  requiredSkills?: string | null  // JSON array
  serviceType?: string
  minExperience?: number
  isUrgent?: boolean
  priorityLevel?: 'NORMAL' | 'URGENT'
  /** If provided, boosts nannies the family has worked with before */
  familyUserId?: string | null
  /** Optional child profiles — enriches matching; if absent, uses original weights */
  children?: ChildMatchInput[]
}

export interface MatchResult {
  nannyProfileId: string
  nannyUserId: string
  name: string
  photoUrl: string | null
  commune: string | null
  rating: number
  totalReviews: number
  experienceYears: number
  level: string
  trustStatus: string
  badgeSource: string
  skills: string | null
  hourlyRate: number
  hourlyRatePremium: number | null
  lat: number | null
  lng: number | null
  coverageRadiusKm: number
  // Verification checklist
  identityVerified: boolean
  backgroundCheck: boolean
  certificationsVerified: boolean
  experienceVerified: boolean
  // Stats
  avgResponseTimeMins: number | null
  acceptanceRate: number | null
  totalFamiliesWorked: number
  totalRebookings: number
  // Scores
  score: number
  distanceScore: number
  availabilityScore: number
  skillScore: number
  ratingScore: number
  historyScore: number
  trustBonus: number
  familyHistoryBonus: number
  distanceKm: number | null
  // Child match
  childMatchScore: number | null
  childMatchLabel: string | null  // friendly label shown in UI, never a number
  workedWithFamily: boolean
}

/**
 * Main matching function — v2.1
 * Base weights:
 *   distance     0.25  (0.35 urgent)
 *   availability 0.30  (0.35 urgent)
 *   skills       0.20  (0.15 urgent)
 *   rating       0.15  (0.10 urgent)
 *   history      0.05
 * Additive bonuses (contextual, capped so total ≤ 1.0):
 *   trustBonus         +0.05 (VERIFIED) | +0.10 (TOP_NANNY)
 *   familyHistoryBonus +0.08 (worked together before)
 */
export async function calculateMatchScore(request: MatchRequest): Promise<MatchResult[]> {
  const isUrgent = request.isUrgent || request.priorityLevel === 'URGENT'

  const hasChildren = request.children && request.children.length > 0

  // Weights — adjust when child data is available
  const wDistance     = isUrgent ? 0.35 : (hasChildren ? 0.20 : 0.25)
  const wAvailability = isUrgent ? 0.35 : (hasChildren ? 0.25 : 0.30)
  const wSkills       = isUrgent ? 0.15 : (hasChildren ? 0.20 : 0.20)
  const wChildMatch   = hasChildren ? 0.20 : 0
  const wRating       = isUrgent ? 0.10 : (hasChildren ? 0.10 : 0.15)
  const wHistory      = hasChildren ? 0.05 : 0.05

  // Fetch all approved, available nannies
  const nannies = await prisma.nannyProfile.findMany({
    where: { isApproved: true, isAvailable: true, user: { status: 'ACTIVE' } },
    include: {
      user: { select: { id: true, name: true } },
      bookings: {
        where: { status: 'COMPLETED' },
        select: { id: true, familyId: true },
      },
    },
  })

  // Build set of nanny IDs this family has previously booked (for history bonus)
  const prevNannyIds = new Set<string>()
  if (request.familyUserId) {
    const prev = await prisma.bookingRequest.findMany({
      where: { familyId: request.familyUserId, status: 'COMPLETED' },
      select: { nannyProfileId: true },
      distinct: ['nannyProfileId'],
    })
    prev.forEach((b) => prevNannyIds.add(b.nannyProfileId))
  }

  const results: MatchResult[] = []

  for (const nanny of nannies) {
    // 0. Hard filters
    if (request.minExperience && nanny.experienceYears < request.minExperience) continue;

    // 1. Distance score (0–1); hard skip if outside coverage
    const distanceScore = calculateDistanceScore(
      nanny.lat, nanny.lng,
      request.lat ?? null, request.lng ?? null,
      nanny.coverageRadiusKm
    )
    if (distanceScore === 0 && request.lat && request.lng) continue

    // 2. Availability score (-1 = conflict → skip)
    const rawAvail = await checkAvailability(nanny.id, request.date, request.startTime, request.endTime)
    if (rawAvail === -1) continue
    const availabilityScore = rawAvail

    // 3. Skill match (0–1)
    const skillScore = calculateSkillMatch(nanny.skills, request.requiredSkills ?? null)

    // 4. Rating normalized 0–1
    const ratingScore = nanny.rating / 5

    // 5. History score
    const completedCount = nanny.bookings.length
    const historyScore = Math.min(completedCount / 20, 1)

    // 6. Child match score (null if no child data → fallback)
    const childMatchScore = hasChildren
      ? calculateChildMatchScore(request.children!, nanny.skills)
      : null

    // ── Contextual bonuses ────────────────────────────────────────────────────
    // Trust bonus based on verification status
    let trustBonus = 0
    if (nanny.trustStatus === 'VERIFIED')  trustBonus = 0.05
    if (nanny.trustStatus === 'TOP_NANNY') trustBonus = 0.10

    // Family history bonus — worked with this family before
    const workedWithFamily = prevNannyIds.has(nanny.id)
    const familyHistoryBonus = workedWithFamily ? 0.08 : 0

    // Composite score (capped at 1.0)
    const score = Math.min(
      distanceScore     * wDistance     +
      availabilityScore * wAvailability +
      skillScore        * wSkills       +
      (childMatchScore !== null ? childMatchScore * wChildMatch : 0) +
      ratingScore       * wRating       +
      historyScore      * wHistory      +
      trustBonus        +
      familyHistoryBonus,
      1
    )

    // Distance in km for display
    let distanceKm: number | null = null
    if (nanny.lat && nanny.lng && request.lat && request.lng) {
      const { calculateDistanceKm } = await import('@/core/location/calculateDistanceKm')
      distanceKm = Math.round(calculateDistanceKm(nanny.lat, nanny.lng, request.lat, request.lng) * 10) / 10
    }

    results.push({
      nannyProfileId: nanny.id,
      nannyUserId: nanny.userId,
      name: nanny.user.name,
      photoUrl: nanny.photoUrl,
      commune: nanny.commune,
      rating: nanny.rating,
      totalReviews: nanny.totalReviews,
      experienceYears: nanny.experienceYears,
      level: nanny.level,
      trustStatus: nanny.trustStatus,
      badgeSource: nanny.badgeSource,
      skills: nanny.skills,
      hourlyRate: nanny.hourlyRate,
      hourlyRatePremium: nanny.hourlyRatePremium,
      lat: nanny.lat,
      lng: nanny.lng,
      coverageRadiusKm: nanny.coverageRadiusKm,
      identityVerified: nanny.identityVerified,
      backgroundCheck: nanny.backgroundCheck,
      certificationsVerified: nanny.certificationsVerified,
      experienceVerified: nanny.experienceVerified,
      avgResponseTimeMins: nanny.avgResponseTimeMins,
      acceptanceRate: nanny.acceptanceRate,
      totalFamiliesWorked: nanny.totalFamiliesWorked,
      totalRebookings: nanny.totalRebookings,
      score,
      distanceScore,
      availabilityScore,
      skillScore,
      ratingScore,
      historyScore,
      trustBonus,
      familyHistoryBonus,
      childMatchScore,
      childMatchLabel: getChildMatchLabel(childMatchScore),
      distanceKm,
      workedWithFamily,
    })
  }

  return results.sort((a, b) => {
    // Primary sort: match score
    if (Math.abs(b.score - a.score) > 0.001) return b.score - a.score
    // Secondary tie-breaker: price (lower is better)
    return a.hourlyRate - b.hourlyRate
  })
}
