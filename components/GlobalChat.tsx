'use client'

import { useState } from 'react'
import ChatButton from './ChatButton'
import ChatPopup from './ChatPopup'

interface GlobalChatProps {
  team: {
    id: string
    name: string
    color: string
  }
}

export default function GlobalChat({ team }: GlobalChatProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {isOpen ? (
        <ChatPopup team={team} onClose={() => setIsOpen(false)} />
      ) : null}
      {!isOpen && (
        <ChatButton onClick={() => setIsOpen(true)} />
      )}
    </>
  )
}
