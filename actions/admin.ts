'use server'

import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { updateUserStatusSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getAdminStats() {
  await requireRole('ADMIN')

  const [totalUsers, totalNannies, totalFamilies, pendingBookings, completedBookings, pendingNannies] =
    await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { role: 'NANNY', deletedAt: null } }),
      prisma.user.count({ where: { role: 'FAMILY', deletedAt: null } }),
      prisma.bookingRequest.count({ where: { status: 'PENDING' } }),
      prisma.bookingRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.nannyProfile.count({ where: { isApproved: false, user: { status: 'ACTIVE' } } }),
    ])

  return { totalUsers, totalNannies, totalFamilies, pendingBookings, completedBookings, pendingNannies }
}

export async function getAdminUsers(page: number = 1, limit: number = 50) {
  await requireRole('ADMIN')
  const skip = (page - 1) * limit
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      image: true,
      nannyProfile: { select: { isApproved: true, commune: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  })
}

export async function getAdminBookings(page: number = 1, limit: number = 50) {
  await requireRole('ADMIN')
  const skip = (page - 1) * limit
  return prisma.bookingRequest.findMany({
    where: { deletedAt: null },
    include: {
      family: { select: { name: true, email: true } },
      nannyProfile: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  })
}

export async function updateUserStatus(userId: string, status: string) {
  await requireRole('ADMIN')

  const parsed = updateUserStatusSchema.safeParse({ userId, status })
  if (!parsed.success) return { error: 'Datos inválidos' }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { status: parsed.data.status as any },
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function approveNanny(userId: string) {
  await requireRole('ADMIN')

  await prisma.nannyProfile.update({
    where: { userId },
    data: { isApproved: true },
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function softDeleteUser(userId: string) {
  await requireRole('ADMIN')

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date(), status: 'BLOCKED' },
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function getPendingPayouts() {
  await requireRole('ADMIN')

  const payments = await prisma.payment.findMany({
    where: { 
      status: 'SUCCESS',
      payoutStatus: 'PENDING'
    },
    include: {
      booking: {
        include: {
          nannyProfile: {
            include: { user: { select: { name: true, email: true } } }
          }
        }
      }
    }
  })

  // Group by nanny
  const payouts: Record<string, { nannyName: string, nannyEmail: string, totalAmount: number, paymentIds: string[] }> = {}
  
  for (const p of payments) {
    const nannyId = p.booking.nannyProfileId
    if (!payouts[nannyId]) {
      payouts[nannyId] = {
        nannyName: p.booking.nannyProfile.user.name,
        nannyEmail: p.booking.nannyProfile.user.email,
        totalAmount: 0,
        paymentIds: []
      }
    }
    payouts[nannyId].totalAmount += p.nannyEarnings
    payouts[nannyId].paymentIds.push(p.id)
  }

  return Object.entries(payouts).map(([id, data]) => ({ nannyId: id, ...data }))
}

export async function markPayoutsAsPaid(paymentIds: string[]) {
  await requireRole('ADMIN')

  await prisma.payment.updateMany({
    where: { id: { in: paymentIds } },
    data: { 
      payoutStatus: 'PAID',
      payoutDate: new Date()
    }
  })

  revalidatePath('/admin/payouts')
  return { success: true }
}

export async function getServiceFee() {
  await requireRole('ADMIN')
  const feeConfig = await prisma.systemConfig.findUnique({ where: { key: 'SERVICE_FEE_PERCENT' } })
  return feeConfig ? parseFloat(feeConfig.value) : 0.15
}

export async function updateServiceFee(percentage: number) {
  await requireRole('ADMIN')
  if (percentage < 0 || percentage > 1) return { error: 'Porcentaje inválido' }

  await prisma.systemConfig.upsert({
    where: { key: 'SERVICE_FEE_PERCENT' },
    update: { value: percentage.toString() },
    create: { key: 'SERVICE_FEE_PERCENT', value: percentage.toString() }
  })

  revalidatePath('/admin/payouts')
  return { success: true }
}
