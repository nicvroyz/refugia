/**
 * VerificationChecklist — shows which identity/credential checks a nanny has passed.
 * Used in nanny public profile and admin panel.
 */

interface ChecklistProps {
  identityVerified: boolean
  backgroundCheck: boolean
  certificationsVerified: boolean
  experienceVerified: boolean
  size?: 'sm' | 'md'
}

interface CheckItem {
  key: keyof Omit<ChecklistProps, 'size'>
  label: string
  icon: string
}

const ITEMS: CheckItem[] = [
  { key: 'identityVerified',       label: 'Identidad verificada',       icon: '🪪' },
  { key: 'backgroundCheck',        label: 'Antecedentes revisados',      icon: '🔍' },
  { key: 'certificationsVerified', label: 'Certificaciones verificadas', icon: '📜' },
  { key: 'experienceVerified',     label: 'Experiencia comprobada',      icon: '⭐' },
]

export function VerificationChecklist({
  identityVerified,
  backgroundCheck,
  certificationsVerified,
  experienceVerified,
  size = 'md',
}: ChecklistProps) {
  const values = { identityVerified, backgroundCheck, certificationsVerified, experienceVerified }
  const passedCount = ITEMS.filter((i) => values[i.key]).length

  return (
    <div className="space-y-2">
      {size === 'md' && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-stone-700">Verificaciones</p>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            passedCount === 4
              ? 'bg-emerald-50 text-emerald-700'
              : passedCount >= 2
                ? 'bg-amber-50 text-amber-700'
                : 'bg-stone-100 text-stone-500'
          }`}>
            {passedCount}/4 completadas
          </span>
        </div>
      )}

      <div className={`grid ${size === 'sm' ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5`}>
        {ITEMS.map((item) => {
          const passed = values[item.key]
          return (
            <div
              key={item.key}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                passed
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-stone-50 text-stone-400 border border-stone-200'
              }`}
            >
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {passed
                ? <span className="text-emerald-500">✓</span>
                : <span className="text-stone-300">–</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * AutoBadges — shows earned reputation badges based on review subcategories.
 * Pass averages for each subcategory; badges appear automatically when threshold met.
 */

interface AutoBadgesProps {
  punctualityAvg?: number | null
  childCareAvg?: number | null
  reliabilityAvg?: number | null
  totalReviews: number
}

interface Badge {
  label: string
  icon: string
  color: string
  condition: (p: AutoBadgesProps) => boolean
}

const AUTO_BADGES: Badge[] = [
  {
    label: 'Muy puntual',
    icon: '⏰',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    condition: ({ punctualityAvg, totalReviews }) => (punctualityAvg ?? 0) >= 4.5 && totalReviews >= 3,
  },
  {
    label: 'Excelente con bebés',
    icon: '👶',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    condition: ({ childCareAvg, totalReviews }) => (childCareAvg ?? 0) >= 4.5 && totalReviews >= 3,
  },
  {
    label: 'Muy confiable',
    icon: '🤝',
    color: 'bg-violet-50 text-violet-700 border-violet-200',
    condition: ({ reliabilityAvg, totalReviews }) => (reliabilityAvg ?? 0) >= 4.5 && totalReviews >= 3,
  },
]

export function AutoBadges({ punctualityAvg, childCareAvg, reliabilityAvg, totalReviews }: AutoBadgesProps) {
  const earned = AUTO_BADGES.filter((b) => b.condition({ punctualityAvg, childCareAvg, reliabilityAvg, totalReviews }))
  if (earned.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {earned.map((b) => (
        <span key={b.label} className={`badge border ${b.color}`}>
          {b.icon} {b.label}
        </span>
      ))}
    </div>
  )
}
