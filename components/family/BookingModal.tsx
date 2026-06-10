'use client'

import { useState, useTransition } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createBookingRequest, calculateBookingPrice } from '@/actions/family'
import { useRouter } from 'next/navigation'

interface Props {
  nannyProfileId: string
  nannyName: string
  buttonText?: string
  initialData?: any
}

export function BookingModal({ nannyProfileId, nannyName, buttonText = "Solicitar cuidado", initialData }: Props) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)
  const [step, setStep] = useState(1) // 1: form, 2: summary
  const [formDataCache, setFormDataCache] = useState<any>(null)
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)

  async function handleNext(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setFormDataCache({
      date: formData.get('date'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      address: formData.get('address'),
      comment: formData.get('comment'),
    })
    
    startTransition(async () => {
      const price = await calculateBookingPrice(nannyProfileId, {
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        serviceType: initialData?.serviceType || 'OCCASIONAL',
        childrenCount: initialData?.childrenCount || 1,
      })
      setEstimatedPrice(price)
      setStep(2)
    })
  }

  async function handleSubmit() {
    if (!formDataCache) return

    startTransition(async () => {
      const data = {
        nannyProfileId,
        date: formDataCache.date as string,
        startTime: formDataCache.startTime as string,
        endTime: formDataCache.endTime as string,
        commune: formDataCache.address as string,
        serviceType: initialData?.serviceType || 'OCCASIONAL',
        childrenCount: initialData?.childrenCount || 1,
        isUrgent: false,
        isRecurrent: false,
        comment: formDataCache.comment as string || undefined,
      }
      const res = await createBookingRequest(data)
      setResult(res)
      if (res.success && res.paymentUrl) {
        window.location.href = res.paymentUrl
      } else if (res.success) {
        setTimeout(() => {
          setIsOpen(false)
          setResult(null)
          router.push('/family/bookings')
        }, 1500)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => { setIsOpen(true); setStep(1); }}
        className="btn-primary flex-shrink-0"
      >
        {buttonText}
      </button>

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setResult(null); setStep(1); }} title={`Solicitar a ${nannyName}`}>
        {result?.success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">¡Redirigiendo al pago!</h3>
            <p className="text-stone-500 text-sm">Te estamos llevando a la pasarela de pago segura...</p>
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleNext} className="space-y-4">
            {result?.error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-rose-400 text-sm">
                {result.error}
              </div>
            )}

            <div>
              <label className="input-label">Fecha</label>
              <input
                name="date"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Hora inicio</label>
                <input name="startTime" type="time" required className="input" defaultValue="09:00" />
              </div>
              <div>
                <label className="input-label">Hora fin</label>
                <input name="endTime" type="time" required className="input" defaultValue="17:00" />
              </div>
            </div>

            <div>
              <label className="input-label">Dirección</label>
              <input
                name="address"
                type="text"
                required
                placeholder="Av. Providencia 1234, Santiago"
                className="input"
                defaultValue={initialData?.address || ''}
              />
            </div>

            <div>
              <label className="input-label">Comentario (opcional)</label>
              <textarea
                name="comment"
                rows={3}
                placeholder="Información adicional para la niñera..."
                className="input resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Continuar al resumen →
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-stone-50 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-stone-800 text-sm border-b border-stone-200 pb-2">Resumen del servicio</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-stone-500">Fecha:</span>
                <span className="text-stone-800 font-medium">{new Date(formDataCache.date).toLocaleDateString('es-CL')}</span>
                
                <span className="text-stone-500">Horario:</span>
                <span className="text-stone-800 font-medium">{formDataCache.startTime} a {formDataCache.endTime}</span>
                
                <span className="text-stone-500">Niños:</span>
                <span className="text-stone-800 font-medium">{initialData?.childrenCount || 1}</span>
                
                <span className="text-stone-500">Tipo:</span>
                <span className="text-stone-800 font-medium">{initialData?.serviceType || 'Ocasional'}</span>
                
                {estimatedPrice !== null && (
                  <>
                    <span className="text-stone-500 font-semibold mt-2">Total a Pagar:</span>
                    <span className="text-violet-700 font-bold text-lg mt-2">${estimatedPrice.toLocaleString('es-CL')}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1" disabled={isPending}>
                Atrás
              </button>
              <button onClick={handleSubmit} disabled={isPending} className="btn-primary flex-1">
                {isPending ? 'Enviando...' : 'Confirmar Solicitud'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
