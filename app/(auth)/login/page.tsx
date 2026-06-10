'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginSchema } from '@/lib/validations'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const parsed = loginSchema.safeParse(form)
    if (!parsed.success) {
      setError(parsed.error.errors[0].message)
      return
    }

    setLoading(true)
    const result = await signIn('credentials', {
      email: form.email.toLowerCase(),
      password: form.password,
      redirect: false,
    })
    setLoading(false)

    if (result?.error) {
      setError('Email o contraseña incorrectos.')
    } else {
      router.refresh()
      router.push('/')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Bienvenido de vuelta</h1>
        <p className="text-stone-500 text-sm mt-1">Ingresa tus datos para continuar</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-sm flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="input-label">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="input-label">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center mt-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Ingresando…
            </>
          ) : 'Iniciar sesión →'}
        </button>
      </form>

      {/* Demo accounts */}
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 text-xs space-y-1.5">
        <p className="font-semibold text-violet-700 mb-2 flex items-center gap-1">🤖 Cuentas demo</p>
        <p className="text-stone-600">Admin: <span className="font-mono text-violet-600">admin@nannyconnect.cl</span> / Admin1234!</p>
        <p className="text-stone-600">Familia: <span className="font-mono text-violet-600">familia@demo.cl</span> / Family1234!</p>
        <p className="text-stone-600">Niñera: <span className="font-mono text-violet-600">nanny1@demo.cl</span> / Nanny1234!</p>
      </div>

      <hr className="border-stone-200" />

      <p className="text-center text-stone-500 text-sm">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors">
          Regístrate gratis →
        </Link>
      </p>
    </div>
  )
}
