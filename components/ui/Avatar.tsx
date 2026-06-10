'use client'

import { useState } from 'react'

interface AvatarProps {
  name: string
  image?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

function initials(name: string) {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

export function Avatar({ name, image, size = 'md' }: AvatarProps) {
  const [imgError, setImgError] = useState(false)
  const cls = sizes[size]

  if (image && !imgError) {
    return (
      <div className={`${cls} rounded-full overflow-hidden flex-shrink-0 bg-stone-100 ring-2 ring-stone-100`}>
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover" 
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div className={`${cls} rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center flex-shrink-0 ring-2 ring-violet-100 uppercase`}>
      {initials(name)}
    </div>
  )
}
