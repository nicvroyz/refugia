'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { registerSchema } from '@/lib/validations'
import { registerUser } from '@/actions/auth'
import { signIn } from 'next-auth/react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = (searchParams.get('role') as 'FAMILY' | 'NANNY') || 'FAMILY'

  const [form, setForm] = useState({ name: '', email: '', password: '', role: defaultRole })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setServerError('')

    const parsed = registerSchema.safeParse(form)
    if (!parsed.success) {
      const fe: Record<string, string> = {}
      parsed.error.errors.forEach((err) => { if (err.path[0]) fe[err.path[0] as string] = err.message })
      setErrors(fe)
      return
    }

    setLoading(true)
    const result = await registerUser(parsed.data)
    if (result.error) { setServerError(result.error); setLoading(false); return }

    await signIn('credentials', { email: form.email.toLowerCase(), password: form.password, redirect: false })
    router.push('/')
  }

  const roles = [
    { value: 'FAMILY', label: 'Soy una familia', icon: '👨‍👩‍👧', desc: 'Busco niñera para mis hijos' },
    { value: 'NANNY',  label: 'Soy niñera',      icon: '👩‍🍼', desc: 'Ofrezco servicios de cuidado' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Crear cuenta gratis</h1>
        <p className="text-stone-500 text-sm mt-1">Únete a Refugia y encuentra niñeras de confianza para tu hogar</p>
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-sm flex items-center gap-2">
          <span>⚠️</span> {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role */}
        <div>
          <label className="input-label">¿Quién eres?</label>
          <div className="grid grid-cols-2 gap-3 mt-1">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm({ ...form, role: r.value as 'FAMILY' | 'NANNY' })}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-200 ${
                  form.role === r.value
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-stone-200 bg-white hover:border-violet-300'
                }`}
              >
                <div className="text-2xl mb-1">{r.icon}</div>
                <div className={`text-sm font-semibold ${form.role === r.value ? 'text-violet-700' : 'text-stone-700'}`}>
                  {r.label}
                </div>
                <div className="text-xs text-stone-400 mt-0.5">{r.desc}</div>
              </button>
            ))}
          </div>
          {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
        </div>

        <div>
          <label htmlFor="name" className="input-label">Nombre completo</label>
          <input id="name" type="text" placeholder="María González" className="input"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="reg-email" className="input-label">Email</label>
          <input id="reg-email" type="email" placeholder="tu@email.com" className="input"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="reg-password" className="input-label">Contraseña</label>
          <input id="reg-password" type="password" placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
            className="input" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Creando cuenta…
            </>
          ) : 'Crear cuenta gratis →'}
        </button>
      </form>

      <hr className="border-stone-200" />

      <p className="text-center text-stone-500 text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors">
          Inicia sesión →
        </Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-stone-400 text-sm text-center py-10">Cargando…</div>}>
      <RegisterForm />
    </Suspense>
  )
}
