import { calculateDistanceKm } from './calculateDistanceKm'

/**
 * Returns true if the family's location is within the nanny's coverage radius.
 */
export function isWithinCoverageRadius(
  nannyLat: number, nannyLng: number, coverageRadiusKm: number,
  familyLat: number, familyLng: number
): boolean {
  const dist = calculateDistanceKm(nannyLat, nannyLng, familyLat, familyLng)
  return dist <= coverageRadiusKm
}
