'use client'

import { useRouter } from 'next/navigation'

export function UrgentCTA() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/family/nannies?urgent=1')}
      className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-white text-base transition-all duration-200 active:scale-[0.98] shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
        boxShadow: '0 4px 20px rgba(220,38,38,.3)',
      }}
    >
      <span className="text-2xl">🚨</span>
      <div className="text-left">
        <div>Lo necesito para hoy</div>
        <div className="text-red-200 text-xs font-normal">Encuentra disponibilidad cerca de ti ahora</div>
      </div>
    </button>
  )
}

interface RebookButtonProps {
  nannyProfileId: string
  nannyName: string
}

export function RebookButton({ nannyProfileId, nannyName }: RebookButtonProps) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(`/family/request/new?nannyId=${nannyProfileId}`)}
      className="btn-secondary text-sm flex items-center gap-1.5"
    >
      🔄 Volver a solicitar a {nannyName.split(' ')[0]}
    </button>
  )
}
