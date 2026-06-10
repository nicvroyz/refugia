import 'next-auth'
import type { Role, UserStatus } from '@/lib/types'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: Role
      status: UserStatus
    }
  }

  interface User {
    id: string
    role: Role
    status: UserStatus
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    status: UserStatus
  }
}
