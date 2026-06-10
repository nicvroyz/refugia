'use client'

import { useState, useTransition } from 'react'
import { markPayoutsAsPaid } from '@/actions/admin'

export function PayoutButton({ paymentIds, amount }: { paymentIds: string[], amount: number }) {
  const [isPending, startTransition] = useTransition()
  const [paid, setPaid] = useState(false)

  const handlePay = () => {
    if (!confirm(`¿Confirmas que has transferido $${amount.toLocaleString('es-CL')} a la niñera?`)) return
    
    startTransition(async () => {
      const res = await markPayoutsAsPaid(paymentIds)
      if (res.success) {
        setPaid(true)
      }
    })
  }

  if (paid) {
    return <span className="text-emerald-600 font-bold text-sm">✅ Pagado</span>
  }

  return (
    <button
      onClick={handlePay}
      disabled={isPending}
      className="btn-primary text-xs py-1.5 px-3"
    >
      {isPending ? 'Procesando...' : 'Marcar como pagado'}
    </button>
  )
}
