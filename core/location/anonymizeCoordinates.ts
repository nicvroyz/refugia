/**
 * Anonymize coordinates by adding random noise (~300m radius).
 * Never expose exact family or nanny location.
 */
export function anonymizeCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  // ~0.003° ≈ 300m of noise
  const noise = () => (Math.random() - 0.5) * 0.006
  return {
    lat: Math.round((lat + noise()) * 10000) / 10000,
    lng: Math.round((lng + noise()) * 10000) / 10000,
  }
}

/**
 * Returns commune centroid coordinates for Santiago communes.
 * Used when user hasn't granted geolocation permission.
 */
export const COMMUNE_COORDS: Record<string, { lat: number; lng: number }> = {
  'Concepción':          { lat: -36.8201, lng: -73.0444 },
  'Talcahuano':          { lat: -36.7167, lng: -73.1167 },
  'San Pedro de la Paz': { lat: -36.8417, lng: -73.1000 },
  'Chiguayante':         { lat: -36.9167, lng: -73.0167 },
  'Hualpén':             { lat: -36.7833, lng: -73.1000 },
  'Penco':               { lat: -36.7333, lng: -72.9833 },
  'Coronel':             { lat: -37.0167, lng: -73.1333 },
  'Lota':                { lat: -37.0833, lng: -73.1500 },
  'Tomé':                { lat: -36.6167, lng: -72.9500 },
  'Hualqui':             { lat: -36.9833, lng: -72.9333 },
}

export function getCommuneCoords(commune: string): { lat: number; lng: number } | null {
  return COMMUNE_COORDS[commune] ?? null
}
