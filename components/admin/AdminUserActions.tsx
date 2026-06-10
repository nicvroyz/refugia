'use client'

import { useState, useTransition } from 'react'
import { updateUserStatus, approveNanny, softDeleteUser } from '@/actions/admin'

interface Props {
  user: {
    id: string
    role: string
    status: string
    nannyProfile?: { isApproved: boolean } | null
  }
}

export function AdminUserActions({ user }: Props) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  async function handleAction(action: string) {
    setOpen(false)
    startTransition(async () => {
      if (action === 'ACTIVE')         await updateUserStatus(user.id, 'ACTIVE')
      else if (action === 'BLOCKED')   await updateUserStatus(user.id, 'BLOCKED')
      else if (action === 'PENDING')   await updateUserStatus(user.id, 'PENDING_REVIEW')
      else if (action === 'APPROVE')   await approveNanny(user.id)
      else if (action === 'DELETE')    await softDeleteUser(user.id)
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200
                   text-stone-600 hover:text-stone-800 text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
      >
        {isPending ? '...' : 'Acciones'} <span className="text-stone-400">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 min-w-44 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
            {/* Status actions */}
            {user.status !== 'ACTIVE' && (
              <ActionItem label="✓ Activar cuenta" onClick={() => handleAction('ACTIVE')} color="emerald" />
            )}
            {user.status !== 'BLOCKED' && (
              <ActionItem label="🚫 Bloquear cuenta" onClick={() => handleAction('BLOCKED')} color="rose" />
            )}
            {user.status !== 'PENDING_REVIEW' && (
              <ActionItem label="⏳ Marcar revisión" onClick={() => handleAction('PENDING')} color="amber" />
            )}

            {/* Nanny-specific */}
            {user.role === 'NANNY' && !user.nannyProfile?.isApproved && (
              <ActionItem label="✓ Aprobar niñera" onClick={() => handleAction('APPROVE')} color="violet" />
            )}

            {/* Divider + delete */}
            <div className="border-t border-stone-100 my-1" />
            <ActionItem label="🗑 Eliminar usuario" onClick={() => handleAction('DELETE')} color="rose" />
          </div>
        </>
      )}
    </div>
  )
}

function ActionItem({
  label, onClick, color,
}: {
  label: string
  onClick: () => void
  color: 'emerald' | 'rose' | 'amber' | 'violet'
}) {
  const colors = {
    emerald: 'hover:bg-emerald-50 hover:text-emerald-700',
    rose:    'hover:bg-rose-50 hover:text-rose-700',
    amber:   'hover:bg-amber-50 hover:text-amber-700',
    violet:  'hover:bg-violet-50 hover:text-violet-700',
  }
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 text-xs text-stone-600 transition-colors duration-150 ${colors[color]}`}
    >
      {label}
    </button>
  )
}
