import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { Role, UserStatus } from '@/lib/types'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña requeridos')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user) throw new Error('Credenciales inválidas')
        if (user.deletedAt) throw new Error('Esta cuenta ha sido eliminada')
        if (user.status === 'BLOCKED') throw new Error('Tu cuenta ha sido bloqueada. Contacta al soporte.')

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) throw new Error('Credenciales inválidas')

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          status: user.status as UserStatus,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.status = (user as any).status
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.status = token.status as UserStatus
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const getSession = () => getServerSession(authOptions)

export async function requireAuth() {
  const session = await getSession()
  if (!session) throw new Error('Not authenticated')
  return session
}

export async function requireRole(role: Role) {
  const session = await requireAuth()
  if (session.user.role !== role) throw new Error('Unauthorized')
  return session
}
