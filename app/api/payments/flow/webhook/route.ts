import { NextResponse } from 'next/server'
import { getPaymentStatus } from '@/lib/payments/flow'
import { prisma } from '@/lib/prisma'
import { sendNewBookingEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const token = formData.get('token') as string

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    // Check with Flow API
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
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
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
                  content: 'Pago confirmado mediante Webhook. La solicitud ha sido enviada a la niñera.',
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

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Webhook error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
