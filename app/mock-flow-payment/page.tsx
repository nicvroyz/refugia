'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function MockPaymentContent() {
  const searchParams = useSearchParams()
  // In a real scenario, Flow just receives the request from the URL generated in createPayment.
  // Our createPayment generates a URL like `/mock-flow-payment?token=...`
  const token = searchParams.get('token')

  const handlePay = () => {
    // Redirect to the return URL with the token simulating a success
    window.location.href = `/api/payments/flow/return?token=${token}`
  }

  const handleCancel = () => {
    // In a real scenario, user goes back or closes the window, but we simulate a cancel
    window.location.href = `/family/bookings`
  }

  if (!token) return <div className="p-10 text-center">Token inválido</div>

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          💳
        </div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Pasarela de Pago (Simulador)</h1>
        <p className="text-stone-500 mb-8">
          Estás en el simulador de pagos porque no se configuró FLOW_API_KEY. Haz clic en "Pagar" para simular una transacción exitosa.
        </p>

        <div className="space-y-3">
          <button onClick={handlePay} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors">
            Simular Pago Exitoso
          </button>
          <button onClick={handleCancel} className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-3 px-4 rounded-xl transition-colors">
            Cancelar Pago
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MockFlowPaymentPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando...</div>}>
      <MockPaymentContent />
    </Suspense>
  )
}
