'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getCommuneCoords, anonymizeCoordinates } from '@/core/location/anonymizeCoordinates'
import { calculateRate, parseDurationHours } from '@/core/pricing/calculateRate'
import { checkAvailability } from '@/core/matching/checkAvailability'
import { sendNewBookingEmail } from '@/lib/email'
import { addDays, addWeeks } from 'date-fns'

// ─── Search Nannies ───────────────────────────────────────────────────────────

export async function getNannies(filters?: {
  commune?: string
  maxRate?: number
  minRating?: number
}) {
  const nannies = await prisma.nannyProfile.findMany({
    where: {
      isApproved: true,
      isAvailable: true,
      user: { status: 'ACTIVE' },
      ...(filters?.commune ? { commune: filters.commune } : {}),
      ...(filters?.maxRate ? { hourlyRate: { lte: filters.maxRate } } : {}),
      ...(filters?.minRating ? { rating: { gte: filters.minRating } } : {}),
    },
    include: {
      user: { select: { name: true, image: true } },
    },
    orderBy: [{ rating: 'desc' }, { experienceYears: 'desc' }],
    take: 50,
  })

  return nannies.map((n) => ({
    ...n,
    // Anonymize coordinates before sending to client
    lat: n.lat ? anonymizeCoordinates(n.lat, n.lng!).lat : null,
    lng: n.lng ? anonymizeCoordinates(n.lat!, n.lng!).lng : null,
  }))
}
// ─── Get Nanny by ID ──────────────────────────────────────────────────────────

export async function getNannyById(id: string) {
  const nanny = await prisma.nannyProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, image: true } },
      availability: { orderBy: { dayOfWeek: 'asc' } },
      bookings: {
        where: { review: { isNot: null } },
        include: {
          review: {
            include: {
              fromUser: { select: { name: true, image: true } },
            },
          },
        },
      },
    },
  })

  if (!nanny) return null

  return {
    ...nanny,
    lat: nanny.lat ? anonymizeCoordinates(nanny.lat, nanny.lng!).lat : null,
    lng: nanny.lng ? anonymizeCoordinates(nanny.lat!, nanny.lng!).lng : null,
  }
}

// ─── Get recommended nannies (initial load without search params) ─────────────

export async function getRecommendedNannies(familyUserId: string) {
  const profile = await prisma.familyProfile.findUnique({
    where: { userId: familyUserId },
  })

  // Use commune coords if no explicit coords
  const coords = profile?.commune ? getCommuneCoords(profile.commune) : null
  const lat = profile?.lat ?? coords?.lat ?? null
  const lng = profile?.lng ?? coords?.lng ?? null

  const { calculateMatchScore } = await import('@/core/matching/calculateMatchScore')
  const results = await calculateMatchScore({
    date: new Date(),
    startTime: '09:00',
    endTime: '17:00',
    lat,
    lng,
  })

  return results.slice(0, 6).map((r) => ({
    ...r,
    lat: r.lat ? anonymizeCoordinates(r.lat, r.lng!).lat : null,
    lng: r.lng ? anonymizeCoordinates(r.lat!, r.lng!).lng : null,
  }))
}

// ─── Create Booking (with optional recurrence) ────────────────────────────────

export async function createBookingRequest(data: {
  nannyProfileId: string
  date: string
  startTime: string
  endTime: string
  commune: string
  serviceType: string
  childrenCount: number
  childrenAges?: string
  requiredSkills?: string | null
  isUrgent: boolean
  isRecurrent: boolean
  recurrenceDays?: string | null
  comment?: string
}) {
  const session = await getSession()
  if (!session || session.user.role !== 'FAMILY') return { error: 'No autorizado' }

  const nanny = await prisma.nannyProfile.findUnique({
    where: { id: data.nannyProfileId },
    include: { user: { select: { name: true } } },
  })
  if (!nanny) return { error: 'Niñera no encontrada' }

  // Check conflicts
  const availScore = await checkAvailability(
    data.nannyProfileId, 
    new Date(data.date), 
    data.startTime, 
    data.endTime
  )
  if (availScore === -1) {
    return { error: 'La niñera ya tiene una reserva o un bloqueo en este horario.' }
  }

  // Calculate pricing
  const durationHours = parseDurationHours(data.startTime, data.endTime)
  const rateCalc = calculateRate(
    nanny.hourlyRate,
    nanny.hourlyRatePremium,
    {
      serviceType: data.serviceType,
      isUrgent: data.isUrgent,
      childrenCount: data.childrenCount,
      startTime: data.startTime,
      endTime: data.endTime,
      experienceYears: nanny.experienceYears,
      level: nanny.level,
    },
    durationHours
  )

  // Resolve commune to coords (approximate)
  const communeCoords = getCommuneCoords(data.commune)

  // Build base booking data
  const baseBooking = {
    familyId: session.user.id,
    nannyProfileId: data.nannyProfileId,
    startTime: data.startTime,
    endTime: data.endTime,
    address: data.commune,
    lat: communeCoords?.lat ?? null,
    lng: communeCoords?.lng ?? null,
    serviceType: data.serviceType,
    childrenCount: data.childrenCount,
    childrenAges: data.childrenAges ?? null,
    requiredSkills: data.requiredSkills ?? null,
    isUrgent: data.isUrgent,
    isRecurrent: data.isRecurrent,
    recurrenceDays: data.recurrenceDays ?? null,
    comment: data.comment ?? null,
    finalRate: rateCalc.finalRate,
    totalAmount: rateCalc.totalAmount,
    status: 'PENDING_PAYMENT',
  }

  try {
    let primaryBookingId: string

    if (!data.isRecurrent) {
      // Single booking
      const newBooking = await prisma.bookingRequest.create({
        data: { ...baseBooking, date: new Date(data.date) },
      })
      primaryBookingId = newBooking.id
    } else {
      // Recurrent: create 4 weekly instances
      const recurringGroupId = crypto.randomUUID()
      const baseDate = new Date(data.date)
      const bookingsData = Array.from({ length: 4 }, (_, i) => ({
        ...baseBooking,
        date: addWeeks(baseDate, i),
        recurringGroupId,
      }))
      
      // Need to create them individually or just get the first one to attach the conversation
      const firstBooking = await prisma.bookingRequest.create({ data: bookingsData[0] })
      primaryBookingId = firstBooking.id
      
      if (bookingsData.length > 1) {
        await prisma.bookingRequest.createMany({ data: bookingsData.slice(1) })
      }
    }

    let paymentUrl = ''
    const nannyUser = await prisma.user.findUnique({ where: { id: nanny.userId } })
    
    if (primaryBookingId) {
      // Get platform fee from config
      const feeConfig = await prisma.systemConfig.findUnique({ where: { key: 'SERVICE_FEE_PERCENT' } })
      const feePercent = feeConfig ? parseFloat(feeConfig.value) : 0.15

      const fee = rateCalc.totalAmount * feePercent
      const nannyEarnings = rateCalc.totalAmount - fee

      const payment = await prisma.payment.create({
        data: {
          bookingId: primaryBookingId,
          amount: rateCalc.totalAmount,
          fee,
          nannyEarnings,
          status: 'PENDING'
        }
      })

      const { createPayment } = await import('@/lib/payments/flow')
      const flowRes = await createPayment({
        amount: rateCalc.totalAmount,
        email: session.user.email ?? '',
        subject: `Cuidado - ${nannyUser?.name}`,
        commerceOrder: payment.id,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/flow/return`
      })

      await prisma.payment.update({
        where: { id: payment.id },
        data: { flowOrder: flowRes.token }
      })

      paymentUrl = flowRes.url + '?token=' + flowRes.token
    }

    // We do NOT send email or create conversation here anymore. 
    // That will happen in the webhook/return endpoint when the payment is SUCCESS.

    revalidatePath('/family')
    return { success: true, paymentUrl }
  } catch (err: any) {
    console.error(err)
    return { error: 'No se pudo procesar la solicitud de cuidado. Intenta de nuevo.' }
  }
}

// ─── Calculate Price API for UI ───────────────────────────────────────────────

export async function calculateBookingPrice(nannyProfileId: string, data: any) {
  const nanny = await prisma.nannyProfile.findUnique({ where: { id: nannyProfileId } })
  if (!nanny) return null

  const durationHours = parseDurationHours(data.startTime, data.endTime)
  const rateCalc = calculateRate(
    nanny.hourlyRate,
    nanny.hourlyRatePremium,
    {
      serviceType: data.serviceType || 'OCCASIONAL',
      isUrgent: false,
      childrenCount: data.childrenCount || 1,
      startTime: data.startTime,
      endTime: data.endTime,
      experienceYears: nanny.experienceYears,
      level: nanny.level,
    },
    durationHours
  )
  return rateCalc.totalAmount
}

// ─── Cancel Booking ───────────────────────────────────────────────────────────

export async function cancelBooking(bookingId: string, reason?: string) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    include: { nannyProfile: { include: { user: { select: { email: true, name: true } } } } },
  })
  if (!booking || booking.familyId !== session.user.id) return { error: 'No autorizado' }
  if (!['PENDING_PAYMENT', 'PENDING', 'REQUESTED', 'IN_CHAT', 'ACCEPTED'].includes(booking.status)) return { error: 'No se puede cancelar' }

  // Detect late cancellation (< 24h before service)
  const hoursUntil = (new Date(booking.date).getTime() - Date.now()) / 3_600_000
  const status = hoursUntil < 24 ? 'CANCELLED_LATE' : 'CANCELLED'

  await prisma.bookingRequest.update({
    where: { id: bookingId },
    data: { status, cancelledAt: new Date(), cancelReason: reason ?? null, deletedAt: new Date() },
  })

  // Inject system message if conversation exists
  const conversation = await prisma.conversation.findUnique({ where: { bookingId } })
  if (conversation) {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: 'SYSTEM',
        content: `Reserva cancelada${reason ? `: ${reason}` : ''}`,
        messageType: 'SYSTEM'
      }
    })
  }

  revalidatePath('/family')
  return { success: true, status }
}

// ─── Toggle Favorite ──────────────────────────────────────────────────────────

export async function toggleFavoriteNanny(nannyProfileId: string) {
  const session = await getSession()
  if (!session || session.user.role !== 'FAMILY') return { error: 'No autorizado' }

  const existing = await prisma.favoriteNanny.findUnique({
    where: {
      familyId_nannyProfileId: {
        familyId: session.user.id,
        nannyProfileId,
      },
    },
  })

  if (existing) {
    await prisma.favoriteNanny.delete({ where: { id: existing.id } })
  } else {
    await prisma.favoriteNanny.create({
      data: {
        familyId: session.user.id,
        nannyProfileId,
      },
    })
  }

  revalidatePath('/family')
  return { success: true, isFavorite: !existing }
}

// ─── Get family bookings ──────────────────────────────────────────────────────

export async function getFamilyBookings(status?: string) {
  const session = await getSession()
  if (!session) return []

  return prisma.bookingRequest.findMany({
    where: {
      familyId: session.user.id,
      deletedAt: null,
      ...(status ? { status } : {}),
    },
    include: {
      nannyProfile: {
        include: { user: { select: { name: true, image: true } } },
      },
    },
    orderBy: { date: 'asc' },
  })
}

// ─── Child Profiles ───────────────────────────────────────────────────────────

export async function getChildProfiles() {
  const session = await getSession()
  if (!session || session.user.role !== 'FAMILY') return []

  const fp = await prisma.familyProfile.findUnique({ where: { userId: session.user.id } })
  if (!fp) return []

  return prisma.childProfile.findMany({
    where: { familyProfileId: fp.id },
    orderBy: { createdAt: 'asc' },
  })
}

export async function saveChildProfile(data: {
  id?: string
  name?: string
  age: number
  temperament?: string
  routines?: string
  supportNeeds?: string
  conditions?: string
  allergies?: string
  specialInstructions?: string
  notes?: string
}) {
  const session = await getSession()
  if (!session || session.user.role !== 'FAMILY') return { error: 'No autorizado' }

  const fp = await prisma.familyProfile.findUnique({ where: { userId: session.user.id } })
  if (!fp) return { error: 'Perfil no encontrado' }

  if (data.id) {
    // Update existing
    await prisma.childProfile.update({
      where: { id: data.id, familyProfileId: fp.id },
      data: {
        name: data.name ?? null,
        age: data.age,
        temperament: data.temperament ?? null,
        routines: data.routines ?? null,
        supportNeeds: data.supportNeeds ?? null,
        conditions: data.conditions ?? null,
        allergies: data.allergies ?? null,
        specialInstructions: data.specialInstructions ?? null,
        notes: data.notes ?? null,
      },
    })
  } else {
    await prisma.childProfile.create({
      data: {
        familyProfileId: fp.id,
        name: data.name ?? null,
        age: data.age,
        temperament: data.temperament ?? null,
        routines: data.routines ?? null,
        supportNeeds: data.supportNeeds ?? null,
        conditions: data.conditions ?? null,
        allergies: data.allergies ?? null,
        specialInstructions: data.specialInstructions ?? null,
        notes: data.notes ?? null,
      },
    })
  }

  revalidatePath('/family/children')
  return { success: true }
}

export async function deleteChildProfile(id: string) {
  const session = await getSession()
  if (!session || session.user.role !== 'FAMILY') return { error: 'No autorizado' }

  const fp = await prisma.familyProfile.findUnique({ where: { userId: session.user.id } })
  if (!fp) return { error: 'Perfil no encontrado' }

  await prisma.childProfile.deleteMany({ where: { id, familyProfileId: fp.id } })
  revalidatePath('/family/children')
  return { success: true }
}
