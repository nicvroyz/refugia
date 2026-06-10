'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Avatar } from '@/components/ui/Avatar'
import type { Role } from '@/lib/types'

interface SidebarProps {
  role: Role
  name: string
  image?: string | null
}

const NAV: Record<Role, { href: string; label: string; icon: string }[]> = {
  FAMILY: [
    { href: '/family',          label: 'Inicio',          icon: '🏠' },
    { href: '/family/profile',  label: 'Mi perfil',       icon: '👤' },
    { href: '/family/children', label: 'Mis hijos',       icon: '👶' },
    { href: '/family/nannies',  label: 'Buscar niñeras',  icon: '🔍' },
    { href: '/family/bookings', label: 'Mis solicitudes', icon: '📋' },
    { href: '/family/messages', label: 'Mensajes',        icon: '💬' },
  ],
  NANNY: [
    { href: '/nanny',          label: 'Inicio',        icon: '🏠' },
    { href: '/nanny/profile',  label: 'Mi perfil',     icon: '👤' },
    { href: '/nanny/requests', label: 'Solicitudes',   icon: '📥' },
    { href: '/nanny/agenda',   label: 'Mi agenda',     icon: '📅' },
    { href: '/nanny/history',  label: 'Historial',     icon: '📊' },
    { href: '/nanny/messages', label: 'Mensajes',      icon: '💬' },
  ],
  ADMIN: [
    { href: '/admin',          label: 'Dashboard',   icon: '📊' },
    { href: '/admin/users',    label: 'Usuarios',    icon: '👥' },
    { href: '/admin/bookings', label: 'Servicios',   icon: '📋' },
    { href: '/admin/payouts',  label: 'Pagos a Niñeras', icon: '💰' },
  ],
}

export function Sidebar({ role, name, image }: SidebarProps) {
  const pathname = usePathname()
  const links = NAV[role] ?? []

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-100 h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-stone-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
            🏠
          </div>
          <span className="text-stone-800 font-bold text-lg">Refugia</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const isActive =
            link.href === '/family' || link.href === '/nanny' || link.href === '/admin'
              ? pathname === link.href
              : pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-stone-100">
        <div className="flex items-center gap-3 mb-3 px-2">
          <Avatar name={name} image={image} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-800 truncate">{name}</p>
            <p className="text-xs text-stone-400 capitalize">{role.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-stone-400
                     hover:text-rose-500 hover:bg-rose-50 transition-all duration-200 text-sm font-medium"
        >
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
