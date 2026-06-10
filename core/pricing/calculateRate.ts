import { getPriceMultiplier, type PriceContext } from './getPriceMultiplier'

export interface RateCalculation {
  baseRate: number
  multiplier: number
  finalRate: number
  totalAmount: number
  isPremium: boolean
  breakdown: string[]
}

/**
 * Calculates the final hourly rate and total amount for a booking.
 */
export function calculateRate(
  hourlyRate: number,
  hourlyRatePremium: number | null,
  ctx: PriceContext,
  durationHours: number
): RateCalculation {
  const multiplier = getPriceMultiplier(ctx)
  const isPremium = multiplier > 1.0

  // Use premium rate if nanny has one and conditions warrant premium pricing
  const baseRate = isPremium && hourlyRatePremium ? hourlyRatePremium : hourlyRate
  const finalRate = Math.round(baseRate * multiplier)
  const totalAmount = Math.round(finalRate * durationHours)

  const breakdown: string[] = []
  if (ctx.isUrgent) breakdown.push('Urgencia +40%')
  if (ctx.serviceType === 'EMERGENCY') breakdown.push('Emergencia +30%')
  if (isNightShift(ctx.startTime, ctx.endTime)) breakdown.push('Horario nocturno +25%')
  if (ctx.childrenCount > 1) breakdown.push(`${ctx.childrenCount} niños +${Math.min((ctx.childrenCount - 1) * 15, 45)}%`)
  if (ctx.level === 'EXPERIENCED') breakdown.push('Niñera experimentada +5%')
  if (ctx.level === 'PREMIUM') breakdown.push('Niñera premium +10%')

  return { baseRate, multiplier, finalRate, totalAmount, isPremium, breakdown }
}

function isNightShift(start: string, end: string): boolean {
  const startH = parseInt(start.split(':')[0], 10)
  const endH   = parseInt(end.split(':')[0], 10)
  return startH >= 21 || endH <= 8
}

/** Parse "09:00" to float hours */
export function parseDurationHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60)
}
