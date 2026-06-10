import { NextResponse } from 'next/server'
import { getPaymentStatus } from '@/lib/payments/flow'
import { prisma } from '@/lib/prisma'
import { sendNewBookingEmail } from '@/lib/email'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/family/bookings?payment=error', req.url))
  }

  try {
    // Check with Flow API (or mock)
    const statusRes = await getPaymentStatus(token)

    // Find the payment in our DB
    const payment = await prisma.payment.findUnique({
      where: { flowOrder: token },
      include: { 
        booking: {
          include: {
            nannyProfile: { include: { user: true } },
            family: true
          }
        } 
      }
    })

    if (!payment) {
      return NextResponse.redirect(new URL('/family/bookings?payment=notfound', req.url))
    }

    // status 2 = PAID
    if (statusRes.status === 2 && payment.status !== 'SUCCESS') {
      await prisma.$transaction(async (tx) => {
        // Mark payment as success
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS' }
        })

        // Update booking status
        await tx.bookingRequest.update({
          where: { id: payment.bookingId },
          data: { status: 'REQUESTED' }
        })

        // Create initial conversation (if not exists)
        const existingConv = await tx.conversation.findUnique({ where: { bookingId: payment.bookingId } })
        if (!existingConv) {
          await tx.conversation.create({
            data: {
              bookingId: payment.bookingId,
              familyId: payment.booking.familyId,
              nannyProfileId: payment.booking.nannyProfileId,
              messages: {
                create: {
                  senderId: 'SYSTEM',
                  content: 'Pago confirmado. La solicitud ha sido enviada a la niñera.',
                  messageType: 'SYSTEM'
                }
              }
            }
          })
        }
      })

      // Send email to nanny
      if (payment.booking.nannyProfile.user.email) {
        sendNewBookingEmail(
          payment.booking.nannyProfile.user.email,
          payment.booking.nannyProfile.user.name,
          payment.booking.date.toISOString(),
          payment.booking.startTime
        ).catch(console.error)
      }
    }

    return NextResponse.redirect(new URL('/family/bookings?payment=success', req.url))
  } catch (err) {
    console.error('Payment verification error', err)
    return NextResponse.redirect(new URL('/family/bookings?payment=error', req.url))
  }
}
