import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      <Sidebar role={session.user.role} name={session.user.name ?? ''} image={session.user.image} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar name={session.user.name ?? ''} role={session.user.role} image={session.user.image} />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
