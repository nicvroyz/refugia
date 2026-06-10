'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { registerSchema, RegisterInput } from '@/lib/validations'

export async function registerUser(data: RegisterInput): Promise<{ error?: string }> {
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { name, email, password, role } = parsed.data

  try {
    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (exists) return { error: 'Este email ya está registrado' }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role as any,
        status: 'ACTIVE',
        ...(role === 'FAMILY' && {
          familyProfile: { create: {} },
        }),
        ...(role === 'NANNY' && {
          nannyProfile: { create: { isApproved: false } },
        }),
      },
    })

    return {}
  } catch (err) {
    console.error('Register error:', err)
    return { error: 'Error al crear la cuenta. Intenta nuevamente.' }
  }
}
