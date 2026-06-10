import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (session) {
    const role = session.user.role
    if (role === 'ADMIN') redirect('/admin')
    if (role === 'NANNY') redirect('/nanny')
    redirect('/family')
  }

  return (
    <div className="min-h-screen flex">

      {/* Left panel — branding + hero (hidden on mobile) */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #5b21b6 0%, #7c3aed 50%, #8b5cf6 100%)' }}
      >
        {/* Hero background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/login-hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.25,
          }}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/60 via-violet-800/40 to-violet-900/80" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl backdrop-blur-sm">🏠</div>
            <span className="text-white font-bold text-xl">Refugia</span>
          </Link>

          {/* Main copy */}
          <div className="space-y-6 py-12">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              🛡️ Niñeras verificadas para tu tranquilidad
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Conectamos familias<br />con niñeras en las que<br />realmente confían.
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              Perfiles revisados, reseñas honestas y agendamiento simple.
            </p>
          </div>

          {/* Social proof */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/20 flex items-center gap-4">
            {/* Avatars as CSS backgrounds */}
            <div className="flex -space-x-2 flex-shrink-0">
              {['/avatars/maria.png', '/avatars/carmen.png', '/avatars/andrea.png'].map((src, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white/80"
                  style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
              ))}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">+50 familias confían en Refugia</p>
              <p className="text-white/60 text-xs">Concepción y alrededores · ⭐ 4.9 promedio</p>
            </div>
          </div>

          <p className="text-white/30 text-xs mt-6">© 2025 Refugia · Hecho con ❤️ en Chile</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-stone-50 to-violet-50/30">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-3xl">👶</span>
              <span className="font-bold text-2xl text-violet-700">Refugia</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
