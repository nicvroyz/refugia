import { prisma } from '@/lib/prisma'

const DAY_MAP: Record<string, number> = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
  THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
}
const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

/**
 * Checks nanny availability for a specific date and time window.
 * Returns a score:
 *   1.0 → nanny is available and has no conflict
 *   0.0 → no availability rule covers this slot
 *   -1   → conflict (existing booking or block)
 */
export async function checkAvailability(
  nannyProfileId: string,
  date: Date,
  startTime: string, // "09:00"
  endTime: string    // "17:00"
): Promise<number> {
  const dayName = DAY_NAMES[date.getDay()]

  // Check weekly availability rule
  const rule = await prisma.nannyAvailability.findUnique({
    where: { nannyProfileId_dayOfWeek: { nannyProfileId, dayOfWeek: dayName } },
  })
  if (!rule) return 0

  // Rule must cover the requested window
  if (startTime < rule.startTime || endTime > rule.endTime) return 0.3 // partial

  // Check for conflicting bookings on that date
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const conflicts = await prisma.bookingRequest.count({
    where: {
      nannyProfileId,
      date: { gte: startOfDay, lte: endOfDay },
      status: { in: ['PENDING', 'REQUESTED', 'IN_CHAT', 'ACCEPTED', 'PENDING_PAYMENT', 'CONFIRMED'] },
      deletedAt: null,
      OR: [
        { startTime: { lt: endTime }, endTime: { gt: startTime } }, // overlap
      ],
    },
  })
  if (conflicts > 0) return -1 // conflict

  // Check manual blocks
  const blocked = await prisma.nannyBlock.count({
    where: {
      nannyProfileId,
      date: { gte: startOfDay, lte: endOfDay },
      OR: [{ startTime: { lt: endTime }, endTime: { gt: startTime } }],
    },
  })
  if (blocked > 0) return -1

  return 1.0
}
