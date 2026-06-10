import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN:  ['/admin'],
  FAMILY: ['/family'],
  NANNY:  ['/nanny'],
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow static files (any path with a file extension)
  if (pathname.includes('.')) {
    return NextResponse.next()
  }

  // Public routes — skip auth
  const publicPaths = ['/', '/login', '/register', '/api/auth', '/unauthorized']
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // Get JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Not authenticated → redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = token.role as string

  // Check role access for dashboard routes
  for (const [requiredRole, paths] of Object.entries(ROLE_ROUTES)) {
    if (paths.some((p) => pathname.startsWith(p))) {
      if (role !== requiredRole && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals, API auth, and ALL static files (anything with a dot)
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)',
  ],
}
