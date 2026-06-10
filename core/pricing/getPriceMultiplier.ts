/**
 * Price multipliers based on service conditions.
 * Returns a multiplier >= 1.0 applied to hourlyRate.
 */

export interface PriceContext {
  serviceType: string   // OCCASIONAL | RECURRENT | OVERNIGHT | EMERGENCY
  isUrgent: boolean
  childrenCount: number
  startTime: string     // "09:00"
  endTime: string       // "17:00"
  experienceYears: number
  level: string         // BASIC | EXPERIENCED | PREMIUM
}

export function getPriceMultiplier(ctx: PriceContext): number {
  let multiplier = 1.0

  // Urgency → +40%
  if (ctx.isUrgent) multiplier += 0.40

  // Overnight (between 21:00–08:00) → +25%
  if (isNightShift(ctx.startTime, ctx.endTime)) multiplier += 0.25

  // Emergency type → +30%
  if (ctx.serviceType === 'EMERGENCY') multiplier += 0.30

  // Multiple children → +15% per extra child (max +45%)
  if (ctx.childrenCount > 1) {
    multiplier += Math.min((ctx.childrenCount - 1) * 0.15, 0.45)
  }

  // PREMIUM level nanny → base is already higher, no extra multiplier needed
  // EXPERIENCED → +5%
  if (ctx.level === 'EXPERIENCED') multiplier += 0.05
  if (ctx.level === 'PREMIUM') multiplier += 0.10

  return Math.round(multiplier * 100) / 100
}

function isNightShift(start: string, end: string): boolean {
  const startH = parseInt(start.split(':')[0], 10)
  const endH   = parseInt(end.split(':')[0], 10)
  return startH >= 21 || endH <= 8 || (startH <= 23 && endH <= 8)
}
