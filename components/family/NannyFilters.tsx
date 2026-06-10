'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

const COMMUNES = [
  'Providencia', 'Las Condes', 'Ñuñoa', 'Santiago', 'Vitacura',
  'La Florida', 'Miraflores', 'Recoleta', 'Independencia', 'Macul',
]
const DAYS = [
  { value: 'MONDAY',    label: 'Lunes' },
  { value: 'TUESDAY',   label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY',  label: 'Jueves' },
  { value: 'FRIDAY',    label: 'Viernes' },
  { value: 'SATURDAY',  label: 'Sábado' },
  { value: 'SUNDAY',    label: 'Domingo' },
]

export function NannyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      startTransition(() => { router.push(`/family/nannies?${params.toString()}`) })
    },
    [router, searchParams]
  )

  const clear = () => {
    startTransition(() => { router.push('/family/nannies') })
  }

  const hasFilters = searchParams.toString() !== ''

  return (
    <div className="space-y-5">
      {/* Comuna */}
      <div>
        <label className="label">Comuna</label>
        <select
          className="input-field"
          value={searchParams.get('commune') ?? ''}
          onChange={(e) => update('commune', e.target.value)}
        >
          <option value="">Todas las comunas</option>
          {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Max rate */}
      <div>
        <label className="label">Tarifa máx. por hora</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="3000"
            max="20000"
            step="500"
            className="w-full accent-brand-600"
            value={searchParams.get('maxRate') ?? '20000'}
            onChange={(e) => update('maxRate', e.target.value)}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Hasta ${Number(searchParams.get('maxRate') ?? 20000).toLocaleString('es-CL')}/h
        </p>
      </div>

      {/* Min experience */}
      <div>
        <label className="label">Experiencia mínima</label>
        <select
          className="input-field"
          value={searchParams.get('minExperience') ?? ''}
          onChange={(e) => update('minExperience', e.target.value)}
        >
          <option value="">Sin mínimo</option>
          <option value="1">1+ años</option>
          <option value="3">3+ años</option>
          <option value="5">5+ años</option>
          <option value="10">10+ años</option>
        </select>
      </div>

      {/* Day of week */}
      <div>
        <label className="label">Disponible el</label>
        <div className="grid grid-cols-2 gap-1.5">
          {DAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() =>
                update('dayOfWeek', searchParams.get('dayOfWeek') === d.value ? '' : d.value)
              }
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                searchParams.get('dayOfWeek') === d.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-raised text-slate-400 hover:bg-surface-hover hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button onClick={clear} className="btn-secondary w-full text-sm py-2">
          {isPending ? 'Limpiando...' : 'Limpiar filtros'}
        </button>
      )}
    </div>
  )
}
