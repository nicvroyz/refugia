'use client'

interface TrustBadgeProps {
  status: string    // PENDING_REVIEW | VERIFIED | TOP_NANNY
  source?: string   // AUTO | MANUAL
  size?: 'sm' | 'md'
}

const CONFIG = {
  PENDING_REVIEW: { icon: '⏳', label: 'En revisión',  cls: 'bg-stone-100 text-stone-600 border-stone-200' },
  VERIFIED:       { icon: '✓',  label: 'Verificada',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  TOP_NANNY:      { icon: '⭐', label: 'Top Niñera',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
} as const

export function TrustBadge({ status, source, size = 'md' }: TrustBadgeProps) {
  const cfg = CONFIG[status as keyof typeof CONFIG] ?? CONFIG.PENDING_REVIEW
  return (
    <span
      className={`inline-flex items-center gap-1 border font-semibold ${cfg.cls} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs rounded-full' : 'px-3 py-1 text-sm rounded-full'
      }`}
      title={source === 'AUTO' ? 'Otorgado automáticamente' : 'Otorgado por el equipo'}
    >
      {cfg.icon} {cfg.label}
    </span>
  )
}
