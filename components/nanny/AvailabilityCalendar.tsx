'use client'

import { useState } from 'react'
import { upsertAvailability, deleteAvailability, addNannyBlock, removeNannyBlock } from '@/actions/nanny'

interface AvailabilityProps {
  initialAvailability: any[]
  initialBlocks: any[]
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miércoles', THURSDAY: 'Jueves', FRIDAY: 'Viernes', SATURDAY: 'Sábado', SUNDAY: 'Domingo'
}

export function AvailabilityCalendar({ initialAvailability, initialBlocks }: AvailabilityProps) {
  const [availability, setAvailability] = useState(initialAvailability)
  const [blocks, setBlocks] = useState(initialBlocks)
  const [loading, setLoading] = useState(false)

  // Block form
  const [blockDate, setBlockDate] = useState('')
  const [blockStart, setBlockStart] = useState('09:00')
  const [blockEnd, setBlockEnd] = useState('18:00')
  const [blockReason, setBlockReason] = useState('')

  const handleUpdateDay = async (day: string, start: string, end: string) => {
    setLoading(true)
    const res = await upsertAvailability(day, start, end)
    if (res.success) {
      setAvailability(prev => {
        const next = [...prev]
        const idx = next.findIndex(a => a.dayOfWeek === day)
        if (idx >= 0) {
          next[idx] = { ...next[idx], startTime: start, endTime: end }
        } else {
          next.push({ dayOfWeek: day, startTime: start, endTime: end })
        }
        return next
      })
    }
    setLoading(false)
  }

  const handleDeleteDay = async (day: string) => {
    setLoading(true)
    const res = await deleteAvailability(day)
    if (res.success) {
      setAvailability(prev => prev.filter(a => a.dayOfWeek !== day))
    }
    setLoading(false)
  }

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blockDate) return
    setLoading(true)
    const res = await addNannyBlock({ date: blockDate, startTime: blockStart, endTime: blockEnd, reason: blockReason })
    if (res.success) {
      // Refresh logic ideally via server revalidate, we just simulate append here
      window.location.reload()
    }
    setLoading(false)
  }

  const handleRemoveBlock = async (id: string) => {
    setLoading(true)
    const res = await removeNannyBlock(id)
    if (res.success) {
      setBlocks(prev => prev.filter(b => b.id !== id))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Default Schedule */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-stone-800">Disponibilidad Semanal</h3>
        <p className="text-xs text-stone-500 mb-4">Define tus horarios habituales de trabajo.</p>
        
        {DAYS.map(day => {
          const slot = availability.find(a => a.dayOfWeek === day)
          return (
            <div key={day} className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl">
              <div className="w-24 text-sm font-medium text-stone-700">{DAY_LABELS[day]}</div>
              {slot ? (
                <>
                  <input type="time" defaultValue={slot.startTime} className="input text-sm py-1" onBlur={e => handleUpdateDay(day, e.target.value, slot.endTime)} disabled={loading} />
                  <span>a</span>
                  <input type="time" defaultValue={slot.endTime} className="input text-sm py-1" onBlur={e => handleUpdateDay(day, slot.startTime, e.target.value)} disabled={loading} />
                  <button onClick={() => handleDeleteDay(day)} className="text-rose-500 text-sm ml-auto hover:underline" disabled={loading}>Quitar</button>
                </>
              ) : (
                <button onClick={() => handleUpdateDay(day, '09:00', '18:00')} className="text-violet-600 text-sm ml-auto font-medium" disabled={loading}>
                  + Añadir horario
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Manual Blocks */}
      <div className="space-y-3 pt-6 border-t border-stone-100">
        <h3 className="text-sm font-semibold text-stone-800">Días Bloqueados (Excepciones)</h3>
        <p className="text-xs text-stone-500 mb-4">Bloquea fechas específicas si tienes compromisos, vacaciones o citas.</p>

        <form onSubmit={handleAddBlock} className="flex flex-wrap items-end gap-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
          <div>
            <label className="text-xs text-stone-500 block mb-1">Fecha</label>
            <input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)} className="input py-1.5 text-sm" required />
          </div>
          <div>
            <label className="text-xs text-stone-500 block mb-1">Inicio</label>
            <input type="time" value={blockStart} onChange={e => setBlockStart(e.target.value)} className="input py-1.5 text-sm w-24" required />
          </div>
          <div>
            <label className="text-xs text-stone-500 block mb-1">Fin</label>
            <input type="time" value={blockEnd} onChange={e => setBlockEnd(e.target.value)} className="input py-1.5 text-sm w-24" required />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-stone-500 block mb-1">Razón (opcional)</label>
            <input type="text" value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="Ej: Cita médica" className="input py-1.5 text-sm" />
          </div>
          <button type="submit" disabled={loading} className="btn-secondary py-1.5 px-4 text-sm whitespace-nowrap">
            Bloquear
          </button>
        </form>

        <div className="space-y-2 mt-4">
          {blocks.length === 0 ? (
            <p className="text-sm text-stone-400 italic">No tienes bloques activos.</p>
          ) : (
            blocks.map(b => (
              <div key={b.id} className="flex justify-between items-center bg-white border border-stone-100 p-3 rounded-lg text-sm">
                <div>
                  <span className="font-semibold">{new Date(b.date).toLocaleDateString('es-CL')}</span>
                  <span className="text-stone-500 ml-2">({b.startTime} - {b.endTime})</span>
                  {b.reason && <span className="text-stone-400 italic ml-2">- {b.reason}</span>}
                </div>
                <button onClick={() => handleRemoveBlock(b.id)} className="text-rose-500 hover:text-rose-600 font-medium">Eliminar</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
