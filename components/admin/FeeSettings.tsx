'use client'

import { useState, useTransition } from 'react'
import { updateServiceFee } from '@/actions/admin'

export function FeeSettings({ currentFee }: { currentFee: number }) {
  const [feePercent, setFeePercent] = useState(currentFee * 100)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const handleSave = () => {
    startTransition(async () => {
      setSuccess(false)
      const res = await updateServiceFee(feePercent / 100)
      if (res.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        alert(res.error)
      }
    })
  }

  return (
    <div className="card p-6 border border-stone-200 shadow-sm bg-white">
      <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
        <span className="text-xl">⚙️</span> Comisión de la Plataforma
      </h3>
      <p className="text-stone-500 text-sm mb-4">
        Este es el porcentaje que la plataforma retiene por cada servicio realizado exitosamente. 
        El resto se asigna a las ganancias de la niñera.
      </p>

      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="number"
            min="0"
            max="100"
            value={feePercent}
            onChange={(e) => setFeePercent(Number(e.target.value))}
            className="input pr-8 w-24 text-right font-bold text-violet-700"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">%</span>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isPending || feePercent === currentFee * 100}
          className="btn-primary text-sm"
        >
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>

        {success && <span className="text-emerald-500 text-sm font-semibold animate-fade-in">¡Guardado!</span>}
      </div>
    </div>
  )
}
