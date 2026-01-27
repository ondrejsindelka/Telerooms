'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { GET_CHAT_MESSAGES, SEND_CHAT_MESSAGE } from '@/lib/graphql/queries'
import TeamBadge from './TeamBadge'

interface ChatPopupProps {
  team: {
    id: string
    name: string
    color: string
  }
  onClose: () => void
}

interface ChatMessage {
  id: string
  teamId: string
  team: {
    id: string
    name: string
    color: string
  }
  message: string
  createdAt: string
}

function formatMessageTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPopup({ team, onClose }: ChatPopupProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { limit: 50 },
    pollInterval: 3000
  })

  const [sendChatMessage] = useMutation(SEND_CHAT_MESSAGE)

  const messages: ChatMessage[] = data?.chatMessages || []
  const sortedMessages = [...messages].reverse()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sortedMessages.length])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending) return

    const msgToSend = message.trim()
    setMessage('')

    // Keep focus immediately
    inputRef.current?.focus()

    setSending(true)
    try {
      await sendChatMessage({
        variables: {
          teamId: team.id,
          message: msgToSend
        }
      })
      refetch()
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessage(msgToSend) // Restore message on error
    } finally {
      setSending(false)
      // Refocus after async operations
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/60 z-40 sm:hidden"
        onClick={onClose}
      />

      {/* Chat window */}
      <div className="fixed z-50 flex flex-col overflow-hidden
        left-2 right-2 bottom-2 top-auto h-[70vh] max-h-[500px]
        sm:left-auto sm:right-4 sm:bottom-14 sm:top-auto sm:h-auto sm:w-80 sm:max-h-[60vh]
        md:w-96
        bg-gray-900 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 border border-teal-500/30">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-teal-500/10 border-b border-teal-500/20 shrink-0">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
          {sortedMessages.length === 0 && (
            <div className="text-center text-gray-500 py-6">
              <svg className="w-10 h-10 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">Žádné zprávy</p>
              <p className="text-xs mt-0.5 text-gray-600">Buďte první!</p>
            </div>
          )}

          {sortedMessages.map((msg) => {
            const isOwn = msg.teamId === team.id
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
              >
                {/* Team badge and time */}
                <div className={`flex items-center gap-1.5 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <TeamBadge name={msg.team.name} color={msg.team.color} size="small" />
                  <span className="text-[9px] text-gray-500">{formatMessageTime(msg.createdAt)}</span>
                </div>

                {/* Message bubble */}
                <div
                  className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-xs leading-relaxed ${
                    isOwn
                      ? 'bg-teal-500/20 text-teal-100 rounded-br-sm'
                      : 'bg-white/10 text-gray-200 rounded-bl-sm'
                  }`}
                  style={{
                    borderLeft: !isOwn ? `2px solid ${msg.team.color}` : undefined,
                    borderRight: isOwn ? `2px solid ${msg.team.color}` : undefined
                  }}
                >
                  {msg.message}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-2.5 border-t border-teal-500/20 bg-gray-900/80 shrink-0">
          <div className="flex gap-2">
            {/* Close button - visible on mobile */}
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden px-2.5 py-2 bg-white/5 hover:bg-white/10 border border-gray-700 text-gray-400 hover:text-white rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              placeholder="Napište zprávu..."
              className="flex-1 px-3 py-2 bg-white/5 border border-teal-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-400/50 text-sm"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!message.trim() || sending}
              tabIndex={-1}
              onTouchEnd={() => setTimeout(() => inputRef.current?.focus(), 50)}
              className="px-3 py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 disabled:bg-gray-800 disabled:border-gray-700 disabled:cursor-not-allowed text-teal-400 disabled:text-gray-600 rounded-xl font-medium transition-colors touch-manipulation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
