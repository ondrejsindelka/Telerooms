'use client'

import { useEffect, useState } from 'react'
import { formatElapsedTime, formatCountdown } from '@/lib/utils'

interface TimerProps {
  type: 'elapsed' | 'countdown'
  time: string
  label: string
}

export default function Timer({ type, time, label }: TimerProps) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    const updateTimer = () => {
      if (type === 'elapsed') {
        setDisplay(formatElapsedTime(time))
      } else {
        setDisplay(formatCountdown(time))
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [type, time])

  return (
    <div className="flex items-center gap-2 text-sm bg-background px-3 py-2 rounded-lg">
      <span className="text-gray-400">{label}:</span>
      <span className="font-mono font-bold text-primary">{display}</span>
    </div>
  )
}
