import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ChatUI } from '@/components/chat/ChatUI'

export const metadata = { title: 'Mensajes | Refugia' }

export default async function FamilyMessagesPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'FAMILY') redirect('/login')

  return (
    <div className="h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-stone-800">Tus mensajes</h1>
        <p className="text-stone-500 text-sm">Coordina los detalles antes de confirmar los servicios.</p>
      </div>
      <ChatUI role="FAMILY" />
    </div>
  )
}
