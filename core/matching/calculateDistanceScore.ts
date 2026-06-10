import { calculateDistanceKm } from '@/core/location/calculateDistanceKm'

const MAX_DISTANCE_KM = 20 // beyond this → score 0

/**
 * Distance score: 1.0 if collocated, 0.0 if >= 20km.
 * Linear decay between 0 and 20km.
 */
export function calculateDistanceScore(
  nannyLat: number | null, nannyLng: number | null,
  familyLat: number | null, familyLng: number | null,
  coverageRadiusKm: number = 5
): number {
  if (!nannyLat || !nannyLng || !familyLat || !familyLng) return 0.5 // neutral if no coords

  const distKm = calculateDistanceKm(nannyLat, nannyLng, familyLat, familyLng)

  // Hard cap: outside coverage radius = 0
  if (distKm > coverageRadiusKm) return 0

  // Normalized: 1 at 0km, 0 at MAX_DISTANCE_KM
  return Math.max(0, 1 - distKm / MAX_DISTANCE_KM)
}
