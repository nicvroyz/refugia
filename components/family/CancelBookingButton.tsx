'use client'

import { useState, useTransition } from 'react'
import { cancelBooking } from '@/actions/family'

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(false)

  async function handleCancel() {
    startTransition(async () => {
      const result = await cancelBooking(bookingId)
      if (result.error) setError(result.error)
    })
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="btn-danger text-xs py-2 px-3"
      >
        Cancelar
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-rose-400">{error}</span>}
      <button
        onClick={handleCancel}
        disabled={isPending}
        className="btn-danger text-xs py-2 px-3"
      >
        {isPending ? '...' : '¿Confirmar?'}
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="text-xs text-stone-400 hover:text-rose-500 transition-colors"
      >
        No
      </button>
    </div>
  )
}
