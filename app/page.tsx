import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Refugia — Niñeras de confianza para tu hogar',
  description: 'Encuentra niñeras verificadas y confiables en Concepción y alrededores. Perfiles revisados, proceso fácil y sin complicaciones.',
}

const HOW_IT_WORKS = [
  {
    icon: '👨‍👩‍👧',
    title: 'Cuéntanos qué necesitas',
    desc: 'Fecha, horario y tu zona. En segundos verás niñeras disponibles cerca de ti.',
  },
  {
    icon: '🔍',
    title: 'Elige con confianza',
    desc: 'Perfiles verificados, reseñas reales y experiencia comprobada para que tomes la mejor decisión.',
  },
  {
    icon: '🤝',
    title: 'Agenda sin complicaciones',
    desc: 'Contacto directo, confirmación rápida. Sin llamadas, sin grupos de Facebook.',
  },
]

const TRUST_FEATURES = [
  {
    icon: '✅',
    title: 'Perfiles revisados',
    desc: 'Cada niñera pasa por un proceso de validación antes de aparecer en resultados. Tú ves solo perfiles confiables.',
  },
  {
    icon: '💬',
    title: 'Reseñas de familias reales',
    desc: 'Las valoraciones vienen de otras familias que ya contrataron. Opiniones honestas, sin filtros.',
  },
  {
    icon: '🔒',
    title: 'Tu privacidad protegida',
    desc: 'Tu dirección exacta nunca se comparte. Solo mostramos tu zona aproximada hasta que confirmes el servicio.',
  },
  {
    icon: '⚡',
    title: 'Para cuando es urgente',
    desc: 'Si lo necesitas hoy, te mostramos quién está disponible ahora mismo cerca de ti.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Valentina M.',
    role: 'Mamá de 2 niños · Providencia',
    text: 'Por fin dejé el grupo de Facebook. Acá encuentro niñeras verificadas, con fotos y reseñas reales. En 20 minutos tenía todo listo.',
    stars: 5,
  },
  {
    name: 'Rodrigo A.',
    role: 'Papá de 3 niños · Las Condes',
    text: 'Lo que más me gustó es que todos los perfiles ya vienen revisados. No tengo que adivinar si es confiable o no.',
    stars: 5,
  },
  {
    name: 'Camila F.',
    role: 'Mamá de 1 bebé · Ñuñoa',
    text: 'Tuve una emergencia y encontré disponibilidad en mi zona en menos de una hora. El servicio fue excelente.',
    stars: 5,
  },
]

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default async function LandingPage() {
  const session = await getSession()
  if (session?.user?.role === 'FAMILY') redirect('/family')
  if (session?.user?.role === 'NANNY')  redirect('/nanny')
  if (session?.user?.role === 'ADMIN')  redirect('/admin')

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fffbf5 0%, #fdf4ff 50%, #f0f9ff 100%)' }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="container-app flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                 style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
              👶
            </div>
            <span className="font-bold text-xl text-violet-700">Refugia</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm hidden sm:inline-flex">Iniciar sesión</Link>
            <Link href="/register" className="btn-primary text-sm">Empezar gratis</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="container-app pt-20 pb-24 text-center">
        {/* Badge — IA mencionada sutilmente */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 border"
             style={{ background: '#fdf4ff', borderColor: '#e9d5ff', color: '#7c3aed' }}>
          🛡️ Niñeras verificadas · Te recomendamos las más compatibles
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-balance mb-6" style={{ color: '#1c1917' }}>
          El cuidado que merecen<br />
          <span style={{ background: 'linear-gradient(135deg, #7c3aed, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            tus hijos.
          </span>
        </h1>

        <p className="text-xl text-stone-500 max-w-xl mx-auto mb-3 text-balance">
          Niñeras confiables para cuando más las necesitas. Perfiles revisados, reseñas reales y agendamiento fácil — para que tus hijos estén bien cuidados mientras tú trabajas.
        </p>
        <p className="text-sm text-stone-400 mb-10">Sin llamadas. Sin grupos de Facebook. Rápido, simple y seguro.</p>

        {/* Quick search */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-5 mb-8 border border-stone-100">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="text-left">
              <label className="input-label">Fecha</label>
              <input type="date" className="input" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="text-left">
              <label className="input-label">Desde</label>
              <input type="time" className="input" defaultValue="09:00" />
            </div>
            <div className="text-left">
              <label className="input-label">Hasta</label>
              <input type="time" className="input" defaultValue="18:00" />
            </div>
            <Link href="/register" className="btn-primary btn-lg justify-center">
              Ver niñeras →
            </Link>
          </div>
          {/* Subtle AI reference — as a footnote, not headline */}
          <p className="text-xs text-stone-400 mt-3 text-center">
            🔒 Sin tarjeta de crédito · Gratis para empezar · Te mostramos las más compatibles contigo
          </p>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-stone-400">
          <span className="flex items-center gap-1.5"><span className="text-amber-400">★★★★★</span> 4.9 promedio</span>
          <span className="text-stone-200">·</span>
          <span>+500 familias</span>
          <span className="text-stone-200">·</span>
          <span>+120 niñeras verificadas</span>
        </div>
      </section>

      {/* ── Tu tranquilidad es lo primero ── */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #fdf4ff, #fdf2f8)' }}>
        <div className="container-app">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-4">Tu tranquilidad es lo primero</h2>
            <p className="text-stone-500 text-lg">Cada detalle está pensado para que confíes en quien cuida a tus hijos.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST_FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-3xl p-6 border border-stone-100 hover:shadow-lg transition-shadow duration-300">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-stone-800 mb-2">{f.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="section">
        <div className="container-app">
          <h2 className="section-title">Así de fácil</h2>
          <p className="section-subtitle">De 0 a niñera confirmada en minutos</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-lg"
                       style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', boxShadow: '0 8px 24px rgba(124,58,237,.25)' }}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-violet-200 flex items-center justify-center text-xs font-bold text-violet-700">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-stone-800">{step.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Niñeras que realmente puedes confiar ── */}
      <section className="section" style={{ background: 'linear-gradient(160deg, #fffbf5, #fdf4ff)' }}>
        <div className="container-app">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-4 leading-snug">
                Niñeras que realmente<br />puedes confiar
              </h2>
              <p className="text-stone-500 text-lg mb-8 leading-relaxed">
                No publicamos cualquier perfil. Cada niñera pasa por un proceso de revisión real, con verificación de identidad y antecedentes.
              </p>
              <div className="space-y-4">
                {[
                  { icon: '🪪', text: 'Identidad verificada personalmente' },
                  { icon: '📜', text: 'Certificaciones y experiencia comprobadas' },
                  { icon: '⭐', text: 'Reseñas de familias reales que las han contratado' },
                  { icon: '🔍', text: 'Revisión de antecedentes antes de publicar el perfil' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-lg flex-shrink-0">
                      {item.icon}
                    </div>
                    <p className="text-stone-600 font-medium">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { emoji: '👩‍🎓', name: 'María R.', tag: '8 años · Providencia', badge: '⭐ Top valorada' },
                { emoji: '👩‍💼', name: 'Catalina V.', tag: '5 años · Las Condes', badge: '✅ Verificada' },
                { emoji: '👩‍🍼', name: 'Andrea S.', tag: '3 años · Ñuñoa', badge: '✅ Verificada' },
                { emoji: '👩‍👧', name: 'Paula M.', tag: '6 años · Santiago', badge: '⭐ Alta valoración' },
              ].map((n) => (
                <div key={n.name} className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-3">{n.emoji}</div>
                  <p className="font-bold text-stone-800">{n.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{n.tag}</p>
                  <span className="mt-2 inline-block text-[11px] font-semibold bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-full">
                    {n.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonios ── */}
      <section className="section">
        <div className="container-app">
          <h2 className="section-title">Lo que dicen las familias</h2>
          <p className="section-subtitle">Experiencias reales de padres como tú</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <Stars n={t.stars} />
                <p className="text-stone-700 italic leading-relaxed text-sm">"{t.text}"</p>
                <div className="border-t border-stone-100 pt-4">
                  <p className="font-bold text-stone-800">{t.name}</p>
                  <p className="text-xs text-stone-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Para niñeras — inclusive, sin requerir título ── */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #fdf4ff, #f0f9ff)' }}>
        <div className="container-app">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-5xl mb-6">🤝</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-4">¿Cuidas o has cuidado niños?</h2>
            <p className="text-stone-500 text-lg mb-3 max-w-xl mx-auto leading-relaxed">
              No importa si tienes título o simplemente años de experiencia y amor por lo que haces — en Refugia hay un lugar para ti.
            </p>
            <p className="text-stone-400 text-sm mb-8 max-w-lg mx-auto">
              Mamás con experiencia, educadoras, cuidadoras con vocación: todas pueden crear su perfil y conectar con familias que necesitan exactamente lo que ofrecen.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: '📅', text: 'Elige tus propios horarios' },
                { icon: '🌟', text: 'Muestra tu experiencia real' },
                { icon: '💰', text: 'Fija tu propia tarifa' },
              ].map((f) => (
                <div key={f.text} className="bg-white rounded-2xl p-4 border border-stone-100 flex items-center gap-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className="text-sm font-semibold text-stone-700">{f.text}</span>
                </div>
              ))}
            </div>
            <Link href="/register?role=nanny" className="btn-primary btn-lg inline-flex">
              Registrarme como niñera →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="section">
        <div className="container-app">
          <div className="rounded-3xl p-10 sm:p-16 text-center text-white relative overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #9d5ee8 100%)', boxShadow: '0 20px 60px rgba(124,58,237,.3)' }}>
            <div className="absolute inset-0 opacity-10"
                 style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)' }} />
            <div className="relative z-10">
              <div className="text-5xl mb-6">🏠</div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
                Solicita con seguridad<br />y sin complicaciones.
              </h2>
              <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto">
                Más de 500 familias ya cuidan a sus hijos con tranquilidad gracias a Refugia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register"
                  className="btn btn-lg bg-white font-bold hover:bg-stone-50 active:scale-[0.98]"
                  style={{ color: '#7c3aed' }}>
                  Encontrar una niñera →
                </Link>
                <Link href="/register?role=nanny"
                  className="btn btn-lg border-2 border-white/40 text-white hover:bg-white/10 active:scale-[0.98]">
                  Soy niñera, quiero registrarme
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-stone-100 py-8">
        <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-600">Refugia</span>
            <span>· Niñeras de confianza para tu hogar · Concepción, Chile</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 justify-center sm:justify-end">
            <Link href="/terminos" className="hover:text-violet-600 transition-colors">Términos</Link>
            <Link href="/privacidad" className="hover:text-violet-600 transition-colors">Privacidad</Link>
            <Link href="/login" className="hover:text-violet-600 transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="hover:text-violet-600 transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
