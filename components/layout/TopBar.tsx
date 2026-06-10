'use client'

import { Avatar } from '@/components/ui/Avatar'
import { RoleBadge } from '@/components/ui/Badges'
import type { Role } from '@/lib/types'

interface TopBarProps {
  name: string
  role: Role
  image?: string | null
}

const GREETINGS: Record<Role, string> = {
  FAMILY: 'Panel familiar',
  NANNY:  'Panel niñera',
  ADMIN:  'Panel de administración',
}

export function TopBar({ name, role, image }: TopBarProps) {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <header className="h-16 bg-white border-b border-stone-100 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
      <div>
        <p className="text-xs text-stone-400">{greeting}, {name.split(' ')[0]}</p>
        <h2 className="text-sm font-semibold text-stone-800">{GREETINGS[role]}</h2>
      </div>

      <div className="flex items-center gap-3">
        <RoleBadge role={role} />
        <Avatar name={name} image={image} size="sm" />
      </div>
    </header>
  )
}
