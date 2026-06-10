'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendNewMessageEmail } from '@/lib/email'

export async function getConversations() {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  const userId = session.user.id
  const isFamily = session.user.role === 'FAMILY'

  const whereClause = isFamily
    ? { familyId: userId }
    : { nannyProfile: { userId } }

  // Auto-create missing conversations for existing bookings (backward compatibility)
  if (isFamily) {
    const bookingsWithoutConv = await prisma.bookingRequest.findMany({
      where: { 
        familyId: userId, 
        conversation: null, 
        deletedAt: null,
        status: { in: ['REQUESTED', 'IN_CHAT', 'ACCEPTED', 'CONFIRMED', 'COMPLETED'] }
      },
    })
    for (const b of bookingsWithoutConv) {
      await prisma.conversation.create({
        data: { bookingId: b.id, familyId: b.familyId, nannyProfileId: b.nannyProfileId }
      })
    }
  } else {
    const profile = await prisma.nannyProfile.findUnique({ where: { userId } })
    if (profile) {
      const bookingsWithoutConv = await prisma.bookingRequest.findMany({
        where: { 
          nannyProfileId: profile.id, 
          conversation: null, 
          deletedAt: null,
          status: { in: ['REQUESTED', 'IN_CHAT', 'ACCEPTED', 'CONFIRMED', 'COMPLETED'] }
        },
      })
      for (const b of bookingsWithoutConv) {
        await prisma.conversation.create({
          data: { bookingId: b.id, familyId: b.familyId, nannyProfileId: b.nannyProfileId }
        })
      }
    }
  }

  const conversations = await prisma.conversation.findMany({
    where: whereClause,
    include: {
      booking: {
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
        },
      },
      family: { select: { name: true, image: true } },
      nannyProfile: { select: { user: { select: { name: true, image: true } } } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Format response for UI
  return conversations.map((conv) => {
    const otherParty = isFamily
      ? { name: conv.nannyProfile.user.name, image: conv.nannyProfile.user.image }
      : { name: conv.family.name, image: conv.family.image }
    
    const lastMessage = conv.messages[0]
    const unreadCount = 0 // Polling simple per MVP

    return {
      id: conv.id,
      bookingId: conv.bookingId,
      booking: conv.booking,
      otherParty,
      lastMessage: lastMessage ? {
        content: lastMessage.content,
        createdAt: lastMessage.createdAt,
        senderId: lastMessage.senderId,
      } : null,
      unreadCount,
    }
  })
}

export async function getConversation(conversationId: string) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      booking: {
        include: {
          nannyProfile: { select: { hourlyRate: true, user: { select: { name: true } } } }
        }
      },
      family: { select: { name: true, image: true } },
      nannyProfile: { select: { user: { select: { name: true, image: true } } } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!conversation) return { error: 'Conversación no encontrada' }

  // Check authorization
  const isFamily = session.user.role === 'FAMILY'
  if (isFamily && conversation.familyId !== session.user.id) return { error: 'No autorizado' }
  if (!isFamily && conversation.nannyProfile.user.name && false) {} // We need to check nanny ownership
  // Wait, the query for nannyProfile included user, but didn't include userId. Let me fetch it directly via db or check the nannyProfile table.
  // Actually, we can just do a fast check:
  
  if (!isFamily) {
    const nannyProfile = await prisma.nannyProfile.findUnique({ where: { userId: session.user.id }})
    if (!nannyProfile || conversation.nannyProfileId !== nannyProfile.id) {
      return { error: 'No autorizado' }
    }
  }

  // Mark unread messages from the other party as read
  const unreadMessageIds = conversation.messages
    .filter(m => m.senderId !== session.user.id && m.senderId !== 'SYSTEM' && !m.readAt)
    .map(m => m.id)

  if (unreadMessageIds.length > 0) {
    await prisma.message.updateMany({
      where: { id: { in: unreadMessageIds } },
      data: { readAt: new Date() }
    })
  }

  const otherParty = isFamily
    ? { name: conversation.nannyProfile.user.name, image: conversation.nannyProfile.user.image }
    : { name: conversation.family.name, image: conversation.family.image }

  return { conversation, otherParty }
}

export async function sendMessage(conversationId: string, content: string) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  if (!content.trim()) return { error: 'El mensaje está vacío' }

  // Verify conversation ownership
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { nannyProfile: true }
  })
  
  if (!conv) return { error: 'Conversación no encontrada' }
  
  const isFamily = session.user.role === 'FAMILY'
  if (isFamily && conv.familyId !== session.user.id) return { error: 'No autorizado' }
  if (!isFamily && conv.nannyProfile.userId !== session.user.id) return { error: 'No autorizado' }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      content: content.trim(),
      messageType: 'TEXT',
    }
  })

  // Update conversation updatedAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  })

  // State transition: REQUESTED -> IN_CHAT
  const booking = await prisma.bookingRequest.findUnique({ where: { id: conv.bookingId } })
  if (booking && booking.status === 'REQUESTED') {
    await prisma.bookingRequest.update({
      where: { id: booking.id },
      data: { status: 'IN_CHAT' }
    })
  }

  // Notify other party
  if (isFamily) {
    const nannyUser = await prisma.user.findUnique({ where: { id: conv.nannyProfile.userId } })
    if (nannyUser?.email) {
      sendNewMessageEmail(nannyUser.email, nannyUser.name, session.user.name || 'Familia').catch(console.error)
    }
  } else {
    const familyUser = await prisma.user.findUnique({ where: { id: conv.familyId } })
    if (familyUser?.email) {
      sendNewMessageEmail(familyUser.email, familyUser.name, session.user.name || 'Niñera').catch(console.error)
    }
  }

  return { success: true, message }
}
