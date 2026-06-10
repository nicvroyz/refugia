import React from 'react'

const STATES = [
  { id: 'REQUESTED', label: 'Solicitada' },
  { id: 'IN_CHAT', label: 'En conversación' },
  { id: 'ACCEPTED', label: 'Aceptada por Niñera' },
  { id: 'PENDING_PAYMENT', label: 'Pago Pendiente' },
  { id: 'CONFIRMED', label: 'Confirmada' },
  { id: 'COMPLETED', label: 'Completada' },
]

export function BookingTimeline({ currentStatus }: { currentStatus: string }) {
  if (['CANCELLED', 'CANCELLED_LATE', 'REJECTED', 'NO_SHOW'].includes(currentStatus)) {
    return (
      <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl">
        <span className="text-xl">❌</span>
        <span className="font-medium text-sm">Solicitud Cancelada o Rechazada</span>
      </div>
    )
  }

  const currentIndex = STATES.findIndex(s => s.id === currentStatus)
  const activeIndex = currentIndex >= 0 ? currentIndex : 0

  return (
    <div className="w-full mt-2 mb-2">
      <div className="flex items-start justify-between relative w-full pt-1">
        {/* Background line */}
        <div className="absolute top-[13px] left-[8%] right-[8%] h-0.5 bg-stone-100 -z-10 rounded-full" />
        {/* Active line */}
        <div 
          className="absolute top-[13px] left-[8%] h-0.5 bg-violet-500 -z-10 rounded-full transition-all duration-500"
          style={{ width: `${(activeIndex / (STATES.length - 1)) * 84}%` }}
        />
        
        {STATES.map((state, index) => {
          const isActive = index <= activeIndex
          const isCurrent = index === activeIndex
          return (
            <div key={state.id} className="flex flex-col items-center gap-2 flex-1 relative group z-10 px-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                isActive ? 'bg-violet-500 border-violet-500 text-white' : 'bg-white border-stone-200'
              }`}>
                {isActive && <span className="text-[12px]">✓</span>}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${
                isCurrent ? 'text-violet-700 font-bold' : isActive ? 'text-stone-600' : 'text-stone-400'
              }`}>
                {state.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
