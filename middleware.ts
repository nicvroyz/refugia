import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

/**
 * Global middleware — protege rutas por rol antes de renderizar cualquier componente.
 * Evita que usuarios autenticados accedan a rutas que no les corresponden.
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // ── Rutas de admin → solo ADMIN ───────────────────────────────────────────
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    // ── Rutas de familia → solo FAMILY ────────────────────────────────────────
    if (pathname.startsWith('/family') && token?.role !== 'FAMILY') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    // ── Rutas de niñera → solo NANNY ──────────────────────────────────────────
    if (pathname.startsWith('/nanny') && token?.role !== 'NANNY') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  },
  {
    callbacks: {
      // Solo ejecuta el middleware si hay un token válido (sesión activa)
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  // Protege todas las rutas del dashboard excepto API y archivos estáticos
  matcher: [
    '/admin/:path*',
    '/family/:path*',
    '/nanny/:path*',
  ],
}
