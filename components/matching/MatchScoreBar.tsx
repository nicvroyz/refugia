'use client'

interface MatchScoreBarProps {
  score: number       // 0–1
  label?: string
  showPercent?: boolean
  breakdown?: {
    distanceScore: number
    availabilityScore: number
    skillScore: number
    ratingScore: number
    historyScore: number
  }
}

export function MatchScoreBar({ score, label, showPercent = true, breakdown }: MatchScoreBarProps) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? 'from-trust-500 to-trust-400'
              : pct >= 60 ? 'from-brand-500 to-brand-400'
              : pct >= 40 ? 'from-amber-500 to-amber-400'
              : 'from-warm-400 to-warm-300'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-warm-500">{label ?? 'Compatibilidad'}</span>
        {showPercent && (
          <span className={`font-bold ${pct >= 80 ? 'text-trust-600' : pct >= 60 ? 'text-brand-600' : 'text-amber-600'}`}>
            {pct}%
          </span>
        )}
      </div>
      <div className="score-bar">
        <div
          className={`score-bar-fill bg-gradient-to-r ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {breakdown && (
        <div className="grid grid-cols-5 gap-1 mt-2">
          {[
            { key: 'Distancia',      val: breakdown.distanceScore },
            { key: 'Disponible',     val: breakdown.availabilityScore },
            { key: 'Skills',         val: breakdown.skillScore },
            { key: 'Rating',         val: breakdown.ratingScore },
            { key: 'Historial',      val: breakdown.historyScore },
          ].map(({ key, val }) => (
            <div key={key} className="flex flex-col items-center gap-0.5">
              <div className="h-1 w-full rounded-full bg-warm-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-400"
                  style={{ width: `${Math.round(val * 100)}%` }}
                />
              </div>
              <span className="text-[9px] text-warm-400">{key}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
