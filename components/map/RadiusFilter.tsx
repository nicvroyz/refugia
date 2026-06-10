'use client'

const RADII = [2, 5, 10, 15] as const
type Radius = typeof RADII[number]

interface RadiusFilterProps {
  value: Radius
  onChange: (r: Radius) => void
}

export default function RadiusFilter({ value, onChange }: RadiusFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-warm-500 font-medium">Radio:</span>
      <div className="flex gap-1 bg-cream-100 rounded-2xl p-1 border border-warm-200">
        {RADII.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              value === r
                ? 'bg-brand-600 text-white shadow-brand'
                : 'text-warm-600 hover:bg-cream-200'
            }`}
          >
            {r} km
          </button>
        ))}
      </div>
    </div>
  )
}
