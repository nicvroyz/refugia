'use client'

import Link from 'next/link'
import { TrustBadge } from '@/components/ui/TrustBadge'
import type { MatchResult } from '@/core/matching/calculateMatchScore'

interface NannyCardProps {
  nanny: MatchResult
  onSelect?: (id: string) => void
  selected?: boolean
  isFavorite?: boolean
}

const EXPERIENCE_PHRASE: (years: number) => string = (y) => {
  if (y >= 10) return `Más de ${y} años cuidando niños con dedicación`
  if (y >= 5)  return `${y} años de experiencia en cuidado infantil`
  if (y >= 2)  return `${y} años apoyando a familias`
  return 'Con formación y dedicación al cuidado'
}

function Stars({ rating, total }: { rating: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-amber-400' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
      </div>
      {rating > 0
        ? <span className="text-xs text-stone-400">{rating.toFixed(1)} ({total} reseña{total !== 1 ? 's' : ''})</span>
        : <span className="text-xs text-stone-400">Sin reseñas aún</span>
      }
    </div>
  )
}

import { FavoriteButton } from './FavoriteButton'

function NannyCard({ nanny, onSelect, selected = false, isFavorite = false }: NannyCardProps) {
  return (
    <div
      className={`nanny-card transition-all duration-200 ${selected ? 'ring-2 ring-violet-400 ring-offset-2' : ''}`}
      onClick={() => onSelect?.(nanny.nannyProfileId)}
    >
      {/* Photo */}
      <div className="nanny-card-photo">
        {nanny.photoUrl ? (
          <img src={nanny.photoUrl} alt={nanny.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-50 to-rose-50">
            <span className="text-6xl">👩‍👧</span>
          </div>
        )}

        {/* Trust badge — top left */}
        <div className="absolute top-3 left-3">
          <TrustBadge status={nanny.trustStatus} size="sm" />
        </div>

        {/* Distance — bottom left */}
        {nanny.distanceKm !== null && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-stone-600 shadow-sm">
            📍 {nanny.distanceKm} km
          </div>
        )}

        {/* Favorite Button — top right */}
        <FavoriteButton 
          nannyProfileId={nanny.nannyProfileId} 
          initialIsFavorite={isFavorite}
          className="absolute top-3 right-3"
        />

        {/* High rating badge */}
        {nanny.rating >= 4.5 && nanny.totalReviews >= 3 && (
          <div className="absolute bottom-3 right-3 bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            ⭐ Alta valoración
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        {/* Name + rate */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-stone-800 text-lg leading-tight">{nanny.name}</h3>
            <p className="text-stone-400 text-xs mt-0.5 italic">{EXPERIENCE_PHRASE(nanny.experienceYears)}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-stone-800">${nanny.hourlyRate.toLocaleString('es-CL')}</p>
            <p className="text-stone-400 text-xs">/hora</p>
          </div>
        </div>

        {/* Stars */}
        <Stars rating={nanny.rating} total={nanny.totalReviews} />

        {/* Child match label — only shown when family has child profiles */}
        {nanny.childMatchLabel && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
            nanny.childMatchLabel.startsWith('Muy')
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-violet-50 text-violet-700 border border-violet-100'
          }`}>
            <span>{nanny.childMatchLabel.startsWith('Muy') ? '❤️' : '✅'}</span>
            {nanny.childMatchLabel}
          </div>
        )}

        {/* Social Proof & Response Prob */}
        <div className="flex flex-wrap gap-1.5">
          {nanny.avgResponseTimeMins !== null && nanny.avgResponseTimeMins < 60 && (
            <span className="badge badge-verified bg-sky-50 text-sky-700 border-sky-200">⚡ Responde rápido</span>
          )}
          {nanny.acceptanceRate !== null && nanny.acceptanceRate >= 0.8 && (
            <span className="badge badge-verified bg-emerald-50 text-emerald-700 border-emerald-200">✨ Alta prob. respuesta</span>
          )}
          {nanny.totalFamiliesWorked > 0 && (
            <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">🤝 {nanny.totalFamiliesWorked} familias</span>
          )}
          {nanny.totalRebookings > 0 && (
            <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">🔄 {nanny.totalRebookings} recontratos</span>
          )}
        </div>

        {/* Skills */}
        {nanny.skills && (() => {
          try {
            const skills: string[] = JSON.parse(nanny.skills)
            return skills.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {skills.slice(0, 3).map((s) => (
                  <span key={s} className="skill-tag text-[10px] px-2 py-0.5 pointer-events-none">{s.replace(/_/g, ' ')}</span>
                ))}
                {skills.length > 3 && <span className="text-xs text-stone-400 self-center">+{skills.length - 3}</span>}
              </div>
            ) : null
          } catch { return null }
        })()}

        {/* CTA */}
        <Link
          href={`/family/nannies/${nanny.nannyProfileId}`}
          onClick={(e) => e.stopPropagation()}
          className="btn-primary w-full justify-center mt-1"
        >
          Solicitar cuidado →
        </Link>
      </div>
    </div>
  )
}

export default NannyCard
