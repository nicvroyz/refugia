'use client'

import { useState, useEffect, useRef } from 'react'
import { getConversations, getConversation, sendMessage } from '@/actions/chat'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badges'

// Refresh interval for polling
const POLL_INTERVAL = 5000

export function ChatUI({ role }: { role: 'FAMILY' | 'NANNY' }) {
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [activeConvData, setActiveConvData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Polling logic
  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      const convs = await getConversations()
      if (mounted && Array.isArray(convs)) {
        setConversations(convs)
      }
      
      if (activeConvId) {
        const detail = await getConversation(activeConvId)
        if (mounted && !detail.error) {
          setActiveConvData(detail)
        }
      }
      setLoading(false)
    }

    fetchData()
    const interval = setInterval(fetchData, POLL_INTERVAL)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [activeConvId])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConvData?.conversation?.messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !activeConvId) return

    setSending(true)
    const content = messageText
    setMessageText('') // optimistically clear

    // Add optimistic message
    if (activeConvData) {
      setActiveConvData((prev: any) => ({
        ...prev,
        conversation: {
          ...prev.conversation,
          messages: [
            ...prev.conversation.messages,
            { id: 'temp', content, senderId: 'me', messageType: 'TEXT', createdAt: new Date() }
          ]
        }
      }))
    }

    const res = await sendMessage(activeConvId, content)
    if (res.error) {
      // Revert optimistic message if error (simplified: just wait for next poll)
    } else {
      // Trigger immediate refresh for active conversation
      const detail = await getConversation(activeConvId)
      if (!detail.error) setActiveConvData(detail)
    }
    setSending(false)
  }

  if (loading && !conversations.length) {
    return <div className="flex h-full items-center justify-center p-8"><div className="animate-pulse text-stone-400">Cargando mensajes...</div></div>
  }

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
      
      {/* Left pane: Conversation List */}
      <div className={`w-full md:w-80 border-r border-stone-100 flex flex-col ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-stone-100">
          <h2 className="font-bold text-stone-800 text-lg">Mensajes</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-stone-400 text-sm">
              No tienes mensajes aún
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-4 hover:bg-stone-50 transition-colors flex items-start gap-3 ${activeConvId === conv.id ? 'bg-violet-50/50' : ''}`}
                >
                  <Avatar name={conv.otherParty.name} image={conv.otherParty.image} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="font-semibold text-stone-800 truncate">{conv.otherParty.name}</p>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-stone-400">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {/* Booking context minimal */}
                    <p className="text-xs text-violet-600 mb-1 font-medium">
                      {new Date(conv.booking.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                    </p>
                    {conv.lastMessage ? (
                      <p className="text-sm text-stone-500 truncate">
                        {conv.lastMessage.senderId === 'SYSTEM' ? '🔔 ' : ''}{conv.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-stone-400 italic">Sin mensajes</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right pane: Active Chat */}
      <div className={`flex-1 flex flex-col bg-stone-50/30 ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
        {!activeConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
            <div className="text-4xl mb-4">💬</div>
            <p>Selecciona una conversación</p>
          </div>
        ) : activeConvData?.conversation ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-stone-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveConvId(null)}
                  className="md:hidden text-stone-400 hover:text-stone-600 mr-2"
                >
                  ←
                </button>
                <Avatar name={activeConvData.otherParty.name} image={activeConvData.otherParty.image} size="sm" />
                <h3 className="font-bold text-stone-800">{activeConvData.otherParty.name}</h3>
              </div>
              <StatusBadge status={activeConvData.conversation.booking.status} />
            </div>

            {/* Context Card (Airbnb style) */}
            <div className="bg-white border-b border-stone-100 p-4 mx-4 mt-4 rounded-2xl shadow-sm flex items-center gap-4 text-sm">
              <div className="bg-violet-100 text-violet-700 w-10 h-10 rounded-xl flex items-center justify-center text-lg">
                📅
              </div>
              <div className="flex-1">
                <p className="font-semibold text-stone-800">
                  Servicio para el {new Date(activeConvData.conversation.booking.date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="text-stone-500">
                  {activeConvData.conversation.booking.startTime} - {activeConvData.conversation.booking.endTime} · {activeConvData.conversation.booking.address}
                </p>
              </div>
              {role === 'NANNY' && activeConvData.conversation.booking.status === 'PENDING' && (
                 <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">Pendiente de tu respuesta</span>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeConvData.conversation.messages.map((msg: any) => {
                const isSystem = msg.messageType === 'SYSTEM'
                const isMe = !isSystem && (
                  (role === 'FAMILY' && msg.senderId === activeConvData.conversation.familyId) ||
                  (role === 'NANNY' && msg.senderId === activeConvData.conversation.nannyProfile.userId) ||
                  msg.senderId === 'me'
                )

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-6">
                      <div className="bg-stone-100 text-stone-500 text-xs px-4 py-2 rounded-full font-medium flex items-center gap-2">
                        <span>🔔</span> {msg.content}
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-violet-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-stone-100 text-stone-800 rounded-tl-sm shadow-sm'
                    }`}>
                      <p>{msg.content}</p>
                      <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-violet-200' : 'text-stone-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-stone-100">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 input rounded-full"
                />
                <button 
                  type="submit" 
                  disabled={!messageText.trim() || sending}
                  className="bg-violet-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-violet-700 transition-colors disabled:opacity-50"
                >
                  ➤
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"></div>
          </div>
        )}
      </div>
      
    </div>
  )
}
