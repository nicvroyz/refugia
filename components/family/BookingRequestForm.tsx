'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SkillsPicker } from '@/components/ui/SkillTag'
import { COMMUNE_COORDS } from '@/core/location/anonymizeCoordinates'
import { createBookingRequest } from '@/actions/family'

const SERVICE_TYPES = [
  { id: 'OCCASIONAL', label: '🌸 Ocasional',  desc: 'Cuidado puntual' },
  { id: 'RECURRENT',  label: '🔄 Recurrente', desc: 'Cuidado semanal regular' },
  { id: 'OVERNIGHT',  label: '🌙 Nocturno',   desc: 'Cuidado de noche' },
  { id: 'EMERGENCY',  label: '🚨 Emergencia', desc: 'Necesito niñera hoy' },
]

const RECURRENCE_DAYS = [
  { id: 'MONDAY',    label: 'Lu' },
  { id: 'TUESDAY',   label: 'Ma' },
  { id: 'WEDNESDAY', label: 'Mi' },
  { id: 'THURSDAY',  label: 'Ju' },
  { id: 'FRIDAY',    label: 'Vi' },
  { id: 'SATURDAY',  label: 'Sa' },
  { id: 'SUNDAY',    label: 'Do' },
]

const COMMUNES = Object.keys(COMMUNE_COORDS)

interface BookingRequestFormProps {
  nannyProfileId: string
  nannyName: string
  hourlyRate: number
  hourlyRatePremium?: number | null
}

export default function BookingRequestForm({
  nannyProfileId,
  nannyName,
  hourlyRate,
  hourlyRatePremium,
}: BookingRequestFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [serviceType, setServiceType] = useState('OCCASIONAL')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [commune, setCommune] = useState('')
  const [childrenCount, setChildrenCount] = useState(1)
  const [childrenAges, setChildrenAges] = useState('')
  const [requiredSkills, setRequiredSkills] = useState<string[]>([])
  const [isUrgent, setIsUrgent] = useState(false)
  const [isRecurrent, setIsRecurrent] = useState(false)
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([])
  const [comment, setComment] = useState('')

  const toggleDay = (d: string) =>
    setRecurrenceDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!date || !startTime || !endTime || !commune) {
      setError('Completa fecha, horario y comuna.')
      return
    }
    if (isRecurrent && recurrenceDays.length === 0) {
      setError('Selecciona los días de recurrencia.')
      return
    }

    setLoading(true)
    try {
      const result = await createBookingRequest({
        nannyProfileId,
        date,
        startTime,
        endTime,
        commune,
        serviceType,
        childrenCount,
        childrenAges,
        requiredSkills: JSON.stringify(requiredSkills),
        isUrgent,
        isRecurrent,
        recurrenceDays: isRecurrent ? JSON.stringify(recurrenceDays) : null,
        comment,
      })

      if (result.error) setError(result.error)
      else router.push('/family?success=booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Service type */}
      <section>
        <h3 className="font-semibold text-warm-700 mb-3 text-sm uppercase tracking-wide">Tipo de servicio</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SERVICE_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setServiceType(t.id); if (t.id === 'EMERGENCY') setIsUrgent(true) }}
              className={`p-3 rounded-2xl border-2 text-left transition-all ${
                serviceType === t.id
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-warm-200 bg-white text-warm-600 hover:border-brand-300'
              }`}
            >
              <div className="font-semibold text-sm">{t.label}</div>
              <div className="text-xs text-warm-400 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Date & time */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="input-label">Fecha</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]} required />
        </div>
        <div>
          <label className="input-label">Hora inicio</label>
          <input type="time" className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div>
          <label className="input-label">Hora fin</label>
          <input type="time" className="input" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
      </section>

      {/* Recurrence */}
      {(serviceType === 'RECURRENT') && (
        <section>
          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-warm-700 cursor-pointer">
              <input type="checkbox" checked={isRecurrent} onChange={(e) => setIsRecurrent(e.target.checked)}
                className="rounded text-brand-600" />
              Solicitar cuidados recurrentes (próximas 4 semanas)
            </label>
          </div>
          {isRecurrent && (
            <div className="flex gap-2 flex-wrap">
              {RECURRENCE_DAYS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDay(d.id)}
                  className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                    recurrenceDays.includes(d.id)
                      ? 'bg-brand-600 text-white shadow-brand'
                      : 'bg-cream-200 text-warm-600 hover:bg-cream-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Location & children */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="input-label">Comuna</label>
          <select className="select" value={commune} onChange={(e) => setCommune(e.target.value)} required>
            <option value="">Seleccionar…</option>
            {COMMUNES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="input-label">Cantidad de niños</label>
          <input type="number" className="input" value={childrenCount} min={1} max={8}
            onChange={(e) => setChildrenCount(Number(e.target.value))} />
        </div>
        <div>
          <label className="input-label">Edades (ej: 3, 6 años)</label>
          <input type="text" className="input" placeholder="3, 6" value={childrenAges}
            onChange={(e) => setChildrenAges(e.target.value)} />
        </div>
      </section>

      {/* Required skills */}
      <section>
        <SkillsPicker
          value={requiredSkills}
          onChange={setRequiredSkills}
          label="Habilidades requeridas (opcional)"
        />
      </section>

      {/* Urgency */}
      <section className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-warm-700 cursor-pointer select-none">
          <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)}
            className="rounded text-red-500 focus:ring-red-400 w-4 h-4" />
          🚨 Solicitud urgente (puede aplicar tarifa premium)
        </label>
      </section>

      {/* Comment */}
      <section>
        <label className="input-label">Comentario adicional</label>
        <textarea className="input min-h-[80px] resize-none" placeholder="Cuéntale a la niñera lo que necesitas saber…"
          value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} />
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">{error}</div>
      )}

      <button type="submit" disabled={loading} className="btn-primary btn-lg w-full justify-center">
        {loading ? 'Enviando solicitud…' : `Solicitar a ${nannyName} →`}
      </button>
    </form>
  )
}
