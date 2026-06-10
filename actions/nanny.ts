'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getCommuneCoords } from '@/core/location/anonymizeCoordinates'
import { notifyFamilyAccepted, notifyFamilyRejected } from '@/lib/notifications'
import { sendBookingAcceptedEmail } from '@/lib/email'

// ─── Auto-update trust badge ──────────────────────────────────────────────────

async function syncTrustBadge(nannyProfileId: string) {
  const nanny = await prisma.nannyProfile.findUnique({ where: { id: nannyProfileId } })
  if (!nanny || nanny.badgeSource === 'MANUAL') return // don't override manual assignments

  let trustStatus = 'PENDING_REVIEW'
  if (nanny.isApproved) {
    trustStatus = 'VERIFIED'
    if (nanny.rating >= 4.8 && nanny.totalReviews >= 10) {
      trustStatus = 'TOP_NANNY'
    }
  }

  if (trustStatus !== nanny.trustStatus) {
    await prisma.nannyProfile.update({
      where: { id: nannyProfileId },
      data: { trustStatus, badgeSource: 'AUTO' },
    })
  }
}

// ─── Update nanny profile ─────────────────────────────────────────────────────

export async function updateNannyProfile(data: {
  bio?: string
  commune?: string
  coverageRadiusKm?: number
  experienceYears?: number
  hourlyRate?: number
  hourlyRatePremium?: number | null
  skills?: string[]        // array of skill ids
  certifications?: string[]
  level?: string
  isAvailable?: boolean
}) {
  const session = await getSession()
  if (!session || session.user.role !== 'NANNY') return { error: 'No autorizado' }

  const profile = await prisma.nannyProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return { error: 'Perfil no encontrado' }

  // Resolve commune to coords
  const communeCoords = data.commune ? getCommuneCoords(data.commune) : null

  await prisma.nannyProfile.update({
    where: { id: profile.id },
    data: {
      bio:               data.bio,
      commune:           data.commune,
      lat:               communeCoords?.lat ?? profile.lat,
      lng:               communeCoords?.lng ?? profile.lng,
      coverageRadiusKm:  data.coverageRadiusKm,
      experienceYears:   data.experienceYears,
      hourlyRate:        data.hourlyRate,
      hourlyRatePremium: data.hourlyRatePremium,
      skills:            data.skills ? JSON.stringify(data.skills) : undefined,
      certifications:    data.certifications ? JSON.stringify(data.certifications) : undefined,
      level:             data.level,
      isAvailable:       data.isAvailable,
    },
  })

  await syncTrustBadge(profile.id)
  revalidatePath('/nanny')
  return { success: true }
}

// ─── Update availability ──────────────────────────────────────────────────────

export async function upsertAvailability(
  dayOfWeek: string,
  startTime: string,
  endTime: string
) {
  const session = await getSession()
  if (!session || session.user.role !== 'NANNY') return { error: 'No autorizado' }

  const profile = await prisma.nannyProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return { error: 'Perfil no encontrado' }

  await prisma.nannyAvailability.upsert({
    where: { nannyProfileId_dayOfWeek: { nannyProfileId: profile.id, dayOfWeek } },
    create: { nannyProfileId: profile.id, dayOfWeek, startTime, endTime },
    update: { startTime, endTime },
  })
  revalidatePath('/nanny')
  return { success: true }
}

export async function deleteAvailability(dayOfWeek: string) {
  const session = await getSession()
  if (!session || session.user.role !== 'NANNY') return { error: 'No autorizado' }

  const profile = await prisma.nannyProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return { error: 'Perfil no encontrado' }

  await prisma.nannyAvailability.deleteMany({
    where: { nannyProfileId: profile.id, dayOfWeek },
  })
  revalidatePath('/nanny')
  return { success: true }
}

// ─── Bulk update availability (used by AvailabilityEditor) ───────────────────

export async function updateAvailability(
  slots: { dayOfWeek: string; startTime: string; endTime: string; enabled: boolean }[]
) {
  const session = await getSession()
  if (!session || session.user.role !== 'NANNY') return { error: 'No autorizado' }

  const profile = await prisma.nannyProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return { error: 'Perfil no encontrado' }

  for (const slot of slots) {
    if (slot.enabled) {
      await prisma.nannyAvailability.upsert({
        where: { nannyProfileId_dayOfWeek: { nannyProfileId: profile.id, dayOfWeek: slot.dayOfWeek } },
        create: { nannyProfileId: profile.id, dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime },
        update: { startTime: slot.startTime, endTime: slot.endTime },
      })
    } else {
      await prisma.nannyAvailability.deleteMany({
        where: { nannyProfileId: profile.id, dayOfWeek: slot.dayOfWeek },
      })
    }
  }

  revalidatePath('/nanny')
  return { success: true }
}

// ─── Block management ─────────────────────────────────────────────────────────

export async function addNannyBlock(data: {
  date: string
  startTime: string
  endTime: string
  reason?: string
}) {
  const session = await getSession()
  if (!session || session.user.role !== 'NANNY') return { error: 'No autorizado' }

  const profile = await prisma.nannyProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return { error: 'Perfil no encontrado' }

  await prisma.nannyBlock.create({
    data: {
      nannyProfileId: profile.id,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason ?? null,
    },
  })
  revalidatePath('/nanny')
  return { success: true }
}

export async function removeNannyBlock(blockId: string) {
  const session = await getSession()
  if (!session || session.user.role !== 'NANNY') return { error: 'No autorizado' }

  await prisma.nannyBlock.delete({ where: { id: blockId } })
  revalidatePath('/nanny')
  return { success: true }
}

// ─── Respond to booking ───────────────────────────────────────────────────────

export async function respondToBooking(bookingId: string, action: 'ACCEPTED' | 'REJECTED') {
  const session = await getSession()
  if (!session || session.user.role !== 'NANNY') return { error: 'No autorizado' }

  const profile = await prisma.nannyProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return { error: 'Perfil no encontrado' }

  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    include: { family: { select: { email: true, name: true } } },
  })
  if (!booking || booking.nannyProfileId !== profile.id) return { error: 'No autorizado' }
  if (!['REQUESTED', 'IN_CHAT'].includes(booking.status)) return { error: 'Esta solicitud ya fue respondida' }

  await prisma.bookingRequest.update({
    where: { id: bookingId },
    data: { status: action },
  })

  // Inject system message if conversation exists
  const conversation = await prisma.conversation.findUnique({ where: { bookingId } })
  if (conversation) {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: 'SYSTEM',
        content: action === 'ACCEPTED' ? 'La niñera aceptó la solicitud' : 'La niñera rechazó la solicitud',
        messageType: 'SYSTEM'
      }
    })
  }

  // Fire notification (non-blocking)
  const dateStr = new Date(booking.date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
  if (action === 'ACCEPTED') {
    notifyFamilyAccepted({
      familyEmail: booking.family.email,
      familyName: booking.family.name,
      nannyName: session.user.name ?? 'La niñera',
      date: dateStr,
      startTime: booking.startTime,
      endTime: booking.endTime,
    }).catch(console.error)

    sendBookingAcceptedEmail(booking.family.email, booking.family.name, session.user.name ?? 'La niñera').catch(console.error)
  } else {
    notifyFamilyRejected({
      familyEmail: booking.family.email,
      familyName: booking.family.name,
      nannyName: session.user.name ?? 'La niñera',
      date: dateStr,
    }).catch(console.error)
  }

  revalidatePath('/nanny')
  return { success: true }
}

// ─── Mark booking completed ───────────────────────────────────────────────────

export async function completeBooking(bookingId: string) {
  const session = await getSession()
  if (!session || session.user.role !== 'NANNY') return { error: 'No autorizado' }

  const profile = await prisma.nannyProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return { error: 'Perfil no encontrado' }

  const booking = await prisma.bookingRequest.findUnique({ where: { id: bookingId } })
  if (!booking || booking.nannyProfileId !== profile.id || booking.status !== 'ACCEPTED') {
    return { error: 'No se puede completar' }
  }

  await prisma.bookingRequest.update({
    where: { id: bookingId },
    data: { status: 'COMPLETED' },
  })

  const conversation = await prisma.conversation.findUnique({ where: { bookingId } })
  if (conversation) {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: 'SYSTEM',
        content: 'El servicio ha finalizado. ¡Gracias por usar Refugia!',
        messageType: 'SYSTEM'
      }
    })
  }

  // Update denormalized stats
  const [sh, sm] = booking.startTime.split(':').map(Number)
  const [eh, em] = booking.endTime.split(':').map(Number)
  const hours = (eh + em / 60) - (sh + sm / 60)

  await prisma.nannyProfile.update({
    where: { id: profile.id },
    data: {
      totalHorasTrabajadas: { increment: hours },
      totalServicios: { increment: 1 },
    },
  })

  // Update family stats
  await prisma.familyProfile.updateMany({
    where: { userId: booking.familyId },
    data: {
      totalHoras: { increment: hours },
      historialServicios: { increment: 1 },
    },
  })

  revalidatePath('/nanny')
  return { success: true }
}

// ─── Get nanny dashboard data ─────────────────────────────────────────────────

export async function getNannyDashboardData() {
  const session = await getSession()
  if (!session || session.user.role !== 'NANNY') return null

  const profile = await prisma.nannyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      availability: { orderBy: { dayOfWeek: 'asc' } },
      blocks: { where: { date: { gte: new Date() } }, orderBy: { date: 'asc' }, take: 10 },
      bookings: {
        where: { deletedAt: null },
        include: { family: { select: { name: true } } },
        orderBy: { date: 'asc' },
        take: 20,
      },
    },
  })

  if (!profile) return null

  const completedBookings = profile.bookings.filter((b) => b.status === 'COMPLETED')
  const totalEarned = completedBookings.reduce((sum, b) => sum + (b.totalAmount ?? 0), 0)
  const pendingBookings = profile.bookings.filter((b) => b.status === 'REQUESTED')
  const upcomingBookings = profile.bookings.filter(
    (b) => b.status === 'ACCEPTED' && new Date(b.date) >= new Date()
  )

  return { profile, totalEarned, pendingBookings, upcomingBookings, completedBookings }
}
