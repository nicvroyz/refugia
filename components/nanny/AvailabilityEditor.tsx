'use client'

import { useState, useTransition } from 'react'
import { updateAvailability } from '@/actions/nanny'

interface Slot {
  dayOfWeek: string
  startTime: string
  endTime: string
}

interface Props {
  initialAvailability: Slot[]
}

const DAYS = [
  { value: 'MONDAY',    label: 'Lunes' },
  { value: 'TUESDAY',   label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY',  label: 'Jueves' },
  { value: 'FRIDAY',    label: 'Viernes' },
  { value: 'SATURDAY',  label: 'Sábado' },
  { value: 'SUNDAY',    label: 'Domingo' },
]

type SlotState = {
  dayOfWeek: string
  startTime: string
  endTime: string
  enabled: boolean
}

export function AvailabilityEditor({ initialAvailability }: Props) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)

  const [slots, setSlots] = useState<SlotState[]>(() =>
    DAYS.map((d) => {
      const existing = initialAvailability.find((a) => a.dayOfWeek === d.value)
      return {
        dayOfWeek: d.value,
        startTime: existing?.startTime ?? '08:00',
        endTime:   existing?.endTime   ?? '18:00',
        enabled:   !!existing,
      }
    })
  )

  function toggle(dayOfWeek: string) {
    setSlots((prev) =>
      prev.map((s) => s.dayOfWeek === dayOfWeek ? { ...s, enabled: !s.enabled } : s)
    )
  }

  function updateTime(dayOfWeek: string, field: 'startTime' | 'endTime', value: string) {
    setSlots((prev) =>
      prev.map((s) => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s)
    )
  }

  async function handleSave() {
    setResult(null)
    startTransition(async () => {
      const res = await updateAvailability(slots)
      setResult(res)
      if (res.success) setTimeout(() => setResult(null), 3000)
    })
  }

  return (
    <div className="space-y-3">
      {result?.error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-rose-400 text-sm">
          {result.error}
        </div>
      )}
      {result?.success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm flex items-center gap-2">
          <span>✓</span> Disponibilidad actualizada correctamente
        </div>
      )}

      {slots.map((slot, idx) => {
        const dayLabel = DAYS[idx].label
        return (
          <div
            key={slot.dayOfWeek}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
              slot.enabled
                ? 'bg-violet-50 border-violet-200'
                : 'bg-stone-50 border-stone-100 opacity-60'
            }`}
          >
            {/* Toggle */}
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={slot.enabled}
                onChange={() => toggle(slot.dayOfWeek)}
              />
              <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer
                            peer-checked:after:translate-x-full peer-checked:bg-violet-600
                            after:content-[''] after:absolute after:top-0.5 after:left-0.5
                            after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>

            {/* Day label */}
            <span className={`w-24 text-sm font-semibold flex-shrink-0 ${slot.enabled ? 'text-violet-700' : 'text-stone-400'}`}>
              {dayLabel}
            </span>

            {/* Time inputs */}
            {slot.enabled ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateTime(slot.dayOfWeek, 'startTime', e.target.value)}
                  className="input py-1.5 text-sm w-32"
                />
                <span className="text-stone-400 text-sm">–</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateTime(slot.dayOfWeek, 'endTime', e.target.value)}
                  className="input py-1.5 text-sm w-32"
                />
              </div>
            ) : (
              <p className="text-sm text-stone-400 flex-1">No disponible</p>
            )}
          </div>
        )
      })}

      <button
        onClick={handleSave}
        disabled={isPending}
        className="btn-primary w-full mt-2"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Guardando disponibilidad...
          </span>
        ) : 'Guardar disponibilidad'}
      </button>
    </div>
  )
}
