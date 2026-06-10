import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-8xl mb-6">🔐</div>
        <h1 className="text-3xl font-black text-stone-800 mb-3">Acceso denegado</h1>
        <p className="text-stone-500 mb-8 max-w-sm mx-auto">
          No tienes permisos para ver esta página. Verifica que hayas iniciado sesión con la cuenta correcta.
        </p>
        <Link href="/" className="btn-primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
