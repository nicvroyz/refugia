'use client'

import { useState, useTransition } from 'react'
import { toggleFavoriteNanny } from '@/actions/family'

interface FavoriteButtonProps {
  nannyProfileId: string
  initialIsFavorite?: boolean
  className?: string
}

export function FavoriteButton({ nannyProfileId, initialIsFavorite = false, className = '' }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    // Optimistic UI
    setIsFavorite(!isFavorite)
    
    startTransition(async () => {
      const res = await toggleFavoriteNanny(nannyProfileId)
      if (res.success && res.isFavorite !== undefined) {
        setIsFavorite(res.isFavorite)
      } else {
        // Revert on error
        setIsFavorite(isFavorite)
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`p-2 rounded-full backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-110 active:scale-95 ${
        isFavorite ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' : 'bg-white/90 text-stone-300 hover:text-rose-400 hover:bg-white'
      } ${className}`}
      title={isFavorite ? 'Quitar de favoritas' : 'Añadir a favoritas'}
    >
      <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorite ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  )
}
