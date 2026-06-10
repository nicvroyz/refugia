import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { calculateMatchScore, type MatchRequest } from '@/core/matching/calculateMatchScore'
import { prisma } from '@/lib/prisma'
import { anonymizeCoordinates } from '@/core/location/anonymizeCoordinates'

/**
 * POST /api/match
 * Body: { date, startTime, endTime, lat?, lng?, requiredSkills?, serviceType?, isUrgent? }
 * OR:   { serviceRequestId } → loads from existing booking
 *
 * Returns ranked list of nannies with match scores.
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (token.role !== 'FAMILY' && token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    let matchRequest: MatchRequest

    if (body.serviceRequestId) {
      // Load from existing booking
      const booking = await prisma.bookingRequest.findUnique({
        where: { id: body.serviceRequestId },
      })
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

      matchRequest = {
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        lat: booking.lat,
        lng: booking.lng,
        requiredSkills: booking.requiredSkills,
        serviceType: booking.serviceType,
        isUrgent: booking.isUrgent,
      }
    } else {
      // Direct payload
      const { date, startTime, endTime, lat, lng, requiredSkills, serviceType, isUrgent, minExperience } = body
      if (!date || !startTime || !endTime) {
        return NextResponse.json({ error: 'date, startTime, endTime are required' }, { status: 400 })
      }
      matchRequest = {
        date: new Date(date),
        startTime,
        endTime,
        lat: lat ?? null,
        lng: lng ?? null,
        requiredSkills: requiredSkills ?? null,
        serviceType: serviceType ?? 'OCCASIONAL',
        minExperience: minExperience ? parseInt(minExperience) : undefined,
        isUrgent: isUrgent ?? false,
      }
    }

    const results = await calculateMatchScore(matchRequest)

    // Anonymize coordinates before returning
    const sanitized = results.map((r) => ({
      ...r,
      lat: r.lat ? anonymizeCoordinates(r.lat, r.lng!).lat : null,
      lng: r.lng ? anonymizeCoordinates(r.lat!, r.lng!).lng : null,
    }))

    return NextResponse.json({
      results: sanitized,
      total: sanitized.length,
      requestedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('[/api/match]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST with matching payload' }, { status: 405 })
}
