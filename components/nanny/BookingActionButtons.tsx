'use client'

import { useState, useTransition } from 'react'
import { respondToBooking, completeBooking } from '@/actions/nanny'

interface Props {
  bookingId: string
  showActions?: boolean   // PENDING → accept/reject
  showComplete?: boolean  // ACCEPTED → mark complete
}

export function BookingActionButtons({ bookingId, showActions, showComplete }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  async function handle(action: 'ACCEPTED' | 'REJECTED' | 'COMPLETE') {
    setError('')
    startTransition(async () => {
      const res = action === 'COMPLETE'
        ? await completeBooking(bookingId)
        : await respondToBooking(bookingId, action)
      if (res.error) setError(res.error)
    })
  }

  return (
    <div className="flex flex-col gap-2 min-w-max">
      {error && <p className="text-xs text-rose-400">{error}</p>}

      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={() => handle('ACCEPTED')}
            disabled={isPending}
            className="btn-success text-xs py-2 px-3"
          >
            ✓ Aceptar
          </button>
          <button
            onClick={() => handle('REJECTED')}
            disabled={isPending}
            className="btn-danger text-xs py-2 px-3"
          >
            ✕ Rechazar
          </button>
        </div>
      )}

      {showComplete && (
        <button
          onClick={() => handle('COMPLETE')}
          disabled={isPending}
          className="btn-primary text-xs py-2 px-3"
        >
          {isPending ? '...' : '🏁 Marcar completada'}
        </button>
      )}
    </div>
  )
}
