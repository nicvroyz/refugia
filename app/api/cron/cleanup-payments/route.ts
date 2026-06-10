import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subHours } from 'date-fns'

export async function GET(req: Request) {
  // Simple auth to prevent abuse
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'dev-secret-cron'}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find payments pending for more than 2 hours
    const expiredThreshold = subHours(new Date(), 2)

    const expiredPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: expiredThreshold }
      },
      select: { id: true, bookingId: true }
    })

    if (expiredPayments.length === 0) {
      return NextResponse.json({ message: 'No expired payments found', count: 0 })
    }

    const paymentIds = expiredPayments.map(p => p.id)
    const bookingIds = expiredPayments.map(p => p.bookingId)

    await prisma.$transaction([
      // Mark payments as failed
      prisma.payment.updateMany({
        where: { id: { in: paymentIds } },
        data: { status: 'FAILED' }
      }),
      // Mark bookings as cancelled
      prisma.bookingRequest.updateMany({
        where: { id: { in: bookingIds } },
        data: { status: 'CANCELLED', cancelReason: 'Pago expirado automáticamente' }
      })
    ])

    return NextResponse.json({ message: 'Cleaned up expired payments', count: expiredPayments.length })
  } catch (error) {
    console.error('Cron cleanup error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
