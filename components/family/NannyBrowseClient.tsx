'use client'

import { useState, useCallback, useTransition } from 'react'
import dynamic from 'next/dynamic'
import NannyCard from '@/components/family/NannyCard'
import RadiusFilter from '@/components/map/RadiusFilter'
import { COMMUNE_COORDS, getCommuneCoords } from '@/core/location/anonymizeCoordinates'
import type { MatchResult } from '@/core/matching/calculateMatchScore'

const NannySearchMap = dynamic(() => import('@/components/map/NannySearchMap'), { ssr: false })

const COMMUNES = Object.keys(COMMUNE_COORDS)

interface NannyBrowseClientProps {
  initialNannies: MatchResult[]
  familyCommune?: string | null
  familyLat?: number | null
  familyLng?: number | null
  favoriteIds?: string[]
}

type View = 'list' | 'map'

export default function NannyBrowseClient({
  initialNannies,
  familyCommune,
  familyLat,
  familyLng,
  favoriteIds = [],
}: NannyBrowseClientProps) {
  const [view, setView] = useState<View>('list')
  const [nannies, setNannies] = useState<MatchResult[]>(initialNannies)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [radius, setRadius] = useState<2 | 5 | 10 | 15>(5)
  const [commune, setCommune] = useState(familyCommune ?? '')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [serviceType, setServiceType] = useState('OCCASIONAL')
  const [minExperience, setMinExperience] = useState(0)
  const [requiredSkill, setRequiredSkill] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [useGeo, setUseGeo] = useState(false)
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isPending, startTransition] = useTransition()

  const effectiveLat = useGeo && geoCoords ? geoCoords.lat : familyLat ?? getCommuneCoords(commune)?.lat ?? null
  const effectiveLng = useGeo && geoCoords ? geoCoords.lng : familyLng ?? getCommuneCoords(commune)?.lng ?? null

  const requestGeo = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setGeoCoords({ lat, lng })
        setUseGeo(true)
        
        // Find closest commune
        let closest = ''
        let minDist = Infinity
        for (const [name, coords] of Object.entries(COMMUNE_COORDS)) {
          const dLat = coords.lat - lat
          const dLng = coords.lng - lng
          const distSq = dLat * dLat + dLng * dLng
          if (distSq < minDist) {
            minDist = distSq
            closest = name
          }
        }
        if (closest) setCommune(closest)
      },
      () => alert('No se pudo obtener la ubicación. Usa la selección de comuna.')
    )
  }

  const search = useCallback(() => {
    if (!date || !startTime || !endTime) return

    startTransition(async () => {
      const communeCoords = getCommuneCoords(commune)
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          startTime,
          endTime,
          lat: effectiveLat,
          lng: effectiveLng,
          serviceType,
          minExperience: minExperience > 0 ? minExperience : undefined,
          requiredSkills: requiredSkill ? JSON.stringify([requiredSkill]) : undefined,
          isUrgent,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setNannies(data.results)
      }
    })
  }, [date, startTime, endTime, effectiveLat, effectiveLng, isUrgent, commune, serviceType, minExperience, requiredSkill])

  const filteredByRadius = nannies.filter((n) =>
    n.distanceKm === null || n.distanceKm <= radius
  )

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="input-label">Comuna</label>
            <select className="select" value={commune} onChange={(e) => setCommune(e.target.value)}>
              <option value="">Seleccionar…</option>
              {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Fecha</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="input-label">Horario</label>
            <div className="flex gap-2">
              <input type="time" className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              <input type="time" className="input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="input-label">Tipo de Servicio</label>
            <select className="select" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
              <option value="OCCASIONAL">Ocasional</option>
              <option value="RECURRENT">Recurrente</option>
              <option value="OVERNIGHT">Nocturno</option>
            </select>
          </div>
          <div>
            <label className="input-label">Exp. Mínima</label>
            <select className="select" value={minExperience} onChange={(e) => setMinExperience(Number(e.target.value))}>
              <option value={0}>Cualquiera</option>
              <option value={1}>1+ años</option>
              <option value={3}>3+ años</option>
              <option value={5}>5+ años</option>
            </select>
          </div>
          <div>
            <label className="input-label">Habilidad / Tarea</label>
            <select className="select" value={requiredSkill} onChange={(e) => setRequiredSkill(e.target.value)}>
              <option value="">Cualquiera</option>
              <option value="primeros_auxilios">Primeros Auxilios</option>
              <option value="apoyo_escolar">Apoyo Escolar</option>
              <option value="recien_nacidos">Recién Nacidos</option>
            </select>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <label className="flex items-center gap-2 text-sm text-warm-600 cursor-pointer">
              <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-400" />
              <span className="font-medium">🚨 Urgente</span>
            </label>
            <button className="btn-primary" onClick={search} disabled={isPending || !date || !startTime || !endTime}>
              {isPending ? 'Buscando…' : '🔍 Buscar niñeras'}
            </button>
          </div>
        </div>

        {/* Geolocation option */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-warm-100">
          {!useGeo ? (
            <button type="button" className="btn-ghost text-xs" onClick={requestGeo}>
              📍 Usar mi ubicación aproximada
            </button>
          ) : (
            <span className="text-xs text-trust-600 font-medium flex items-center gap-1">
              ✓ Ubicación aproximada activada
              <button className="text-warm-400 ml-1 hover:text-warm-600" onClick={() => setUseGeo(false)}>✕</button>
            </span>
          )}
          <span className="text-xs text-warm-400">🔒 Nunca compartimos tu dirección exacta</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <p className="text-warm-600 text-sm font-medium">
            {filteredByRadius.length} niñera{filteredByRadius.length !== 1 ? 's' : ''} encontrada{filteredByRadius.length !== 1 ? 's' : ''}
          </p>
          <RadiusFilter value={radius} onChange={setRadius} />
        </div>

        {/* View toggle */}
        <div className="flex gap-1 bg-cream-100 rounded-2xl p-1 border border-warm-200">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              view === 'list' ? 'bg-white shadow-warm-sm text-brand-700' : 'text-warm-500 hover:text-warm-700'
            }`}
          >
            ☰ Lista
          </button>
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              view === 'map' ? 'bg-white shadow-warm-sm text-brand-700' : 'text-warm-500 hover:text-warm-700'
            }`}
          >
            🗺 Mapa
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <NannySearchMap
              nannies={filteredByRadius}
              familyLat={effectiveLat}
              familyLng={effectiveLng}
              selectedId={selectedId}
              onSelectNanny={setSelectedId}
              radiusKm={radius}
            />
          </div>
          {/* Sidebar list */}
          <div className="space-y-3 overflow-y-auto max-h-[520px] scrollbar-hide pr-1">
            {filteredByRadius.map((n) => (
              <NannyCard
                key={n.nannyProfileId}
                nanny={n}
                selected={selectedId === n.nannyProfileId}
                onSelect={setSelectedId}
                isFavorite={favoriteIds.includes(n.nannyProfileId)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredByRadius.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-warm-400">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-semibold text-lg text-warm-600">No encontramos niñeras disponibles</p>
              <p className="text-sm mt-2">Intenta cambiar la fecha, hora o ampliar el radio de búsqueda</p>
            </div>
          ) : (
            filteredByRadius.map((n) => (
              <NannyCard
                key={n.nannyProfileId}
                nanny={n}
                selected={selectedId === n.nannyProfileId}
                onSelect={setSelectedId}
                isFavorite={favoriteIds.includes(n.nannyProfileId)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
