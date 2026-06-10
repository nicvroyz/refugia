'use client'

import { useEffect, useRef, useState } from 'react'
import type { MatchResult } from '@/core/matching/calculateMatchScore'
import { anonymizeCoordinates, COMMUNE_COORDS } from '@/core/location/anonymizeCoordinates'

interface NannySearchMapProps {
  nannies: MatchResult[]
  familyLat?: number | null
  familyLng?: number | null
  selectedId?: string | null
  onSelectNanny?: (id: string) => void
  radiusKm?: number
}

// Default: center of Santiago
const DEFAULT_CENTER: [number, number] = [-33.4569, -70.6483]

export default function NannySearchMap({
  nannies,
  familyLat,
  familyLng,
  selectedId,
  onSelectNanny,
  radiusKm = 5,
}: NannySearchMapProps) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => { setIsClient(true) }, [])

  useEffect(() => {
    if (!isClient || !containerRef.current || mapRef.current) return

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default icon paths
      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
      L.Marker.prototype.options.icon = DefaultIcon

      const center: [number, number] = familyLat && familyLng
        ? [familyLat, familyLng]
        : DEFAULT_CENTER

      const map = L.map(containerRef.current!, { zoomControl: true, scrollWheelZoom: false }).setView(center, 13)
      mapRef.current = map

      // OpenStreetMap tiles (free, no API key)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      // Family marker
      if (familyLat && familyLng) {
        const familyIcon = L.divIcon({
          html: `<div class="flex items-center justify-center w-10 h-10 bg-sky-500 rounded-full shadow-lg border-2 border-white text-white text-lg">🏠</div>`,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })
        L.marker([familyLat, familyLng], { icon: familyIcon })
          .addTo(map)
          .bindPopup('<div class="p-2 text-sm font-semibold text-warm-800">Tu ubicación<br/><span class="text-xs text-warm-400">Aproximada por seguridad</span></div>')

        // Coverage circle
        L.circle([familyLat, familyLng], {
          radius: radiusKm * 1000,
          color: '#8b5cf6',
          fillColor: '#8b5cf6',
          fillOpacity: 0.06,
          weight: 1.5,
          dashArray: '6 4',
        }).addTo(map)
      }

      // Nanny markers
      nannies.forEach((nanny) => {
        if (!nanny.lat || !nanny.lng) return
        const anonCoords = anonymizeCoordinates(nanny.lat, nanny.lng)

        const isSelected = nanny.nannyProfileId === selectedId
        const pct = Math.round(nanny.score * 100)
        const scoreColor = pct >= 80 ? '#059669' : pct >= 60 ? '#7c3aed' : '#f59e0b'

        const icon = L.divIcon({
          html: `
            <div class="relative" style="filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2))">
              <div style="
                width: ${isSelected ? '52px' : '44px'};
                height: ${isSelected ? '52px' : '44px'};
                border-radius: 50%;
                background: ${isSelected ? 'linear-gradient(135deg, #7c3aed, #a78bfa)' : 'white'};
                border: ${isSelected ? '3px solid #7c3aed' : '2px solid ' + scoreColor};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${isSelected ? '24px' : '20px'};
                transition: all 0.2s;
              ">
                ${nanny.photoUrl ? `<img src="${nanny.photoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />` : '👩‍👧'}
              </div>
              <div style="
                position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
                background: ${scoreColor}; color: white;
                border-radius: 10px; padding: 1px 5px;
                font-size: 9px; font-weight: 700; white-space: nowrap;
              ">${pct}%</div>
            </div>`,
          className: '',
          iconSize: [isSelected ? 52 : 44, isSelected ? 64 : 56],
          iconAnchor: [isSelected ? 26 : 22, isSelected ? 56 : 48],
          popupAnchor: [0, -50],
        })

        const popup = L.popup({ closeButton: false, maxWidth: 220 }).setContent(`
          <div style="padding: 12px; font-family: Inter, sans-serif; min-width: 180px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
              <div style="width:40px;height:40px;border-radius:50%;background:#f5f3ff;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">
                ${nanny.photoUrl ? `<img src="${nanny.photoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />` : '👩‍👧'}
              </div>
              <div>
                <div style="font-weight:700;color:#292524;font-size:14px;">${nanny.name}</div>
                <div style="color:#78716c;font-size:11px;">${nanny.commune ?? 'Santiago'}</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="color:#f59e0b;font-size:13px;">⭐ ${nanny.rating.toFixed(1)}</span>
              <span style="font-weight:700;color:#292524;">$${nanny.hourlyRate.toLocaleString('es-CL')}/hr</span>
            </div>
            ${nanny.distanceKm !== null ? `<div style="color:#78716c;font-size:11px;margin-bottom:8px;">📍 ~${nanny.distanceKm} km · Ubicación aproximada</div>` : ''}
            <a href="/family/nannies/${nanny.nannyProfileId}"
               style="display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:white;padding:6px 12px;border-radius:12px;font-size:12px;font-weight:600;text-decoration:none;">
              Ver perfil →
            </a>
          </div>
        `)

        const marker = L.marker([anonCoords.lat, anonCoords.lng], { icon })
          .addTo(map)
          .bindPopup(popup)

        marker.on('click', () => {
          onSelectNanny?.(nanny.nannyProfileId)
        })
      })

      setMapLoaded(true)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isClient]) // only mount once

  if (!isClient) {
    return (
      <div className="map-container h-[480px] flex items-center justify-center bg-cream-100">
        <div className="text-warm-400 text-sm">Cargando mapa…</div>
      </div>
    )
  }

  return (
    <div className="map-container relative">
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div ref={containerRef} style={{ height: '480px', width: '100%' }} />

      {/* Privacy notice */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-warm-500 shadow-warm-sm z-[1000]">
        🔒 Ubicación aproximada por seguridad
      </div>
    </div>
  )
}
