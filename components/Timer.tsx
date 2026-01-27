'use client'

import { useEffect, useState, useRef } from 'react'
import { formatElapsedTime, formatCountdown } from '@/lib/utils'

interface TimerProps {
  type: 'elapsed' | 'countdown'
  time: string
  label: string
  size?: 'normal' | 'large'
  onExpire?: () => void
  onWarning?: () => void
}

export default function Timer({ type, time, label, size = 'normal', onExpire, onWarning }: TimerProps) {
  const [display, setDisplay] = useState('')
  const [isWarning, setIsWarning] = useState(false)
  const expiredCalledRef = useRef(false)
  const warningCalledRef = useRef(false)

  useEffect(() => {
    // Reset flags when time changes
    expiredCalledRef.current = false
    warningCalledRef.current = false
    setIsWarning(false)
  }, [time])

  useEffect(() => {
    const updateTimer = () => {
      if (type === 'elapsed') {
        setDisplay(formatElapsedTime(time))
      } else {
        const countdown = formatCountdown(time)
        setDisplay(countdown)

        // Check remaining seconds for warning (<=60s)
        const targetTime = new Date(time).getTime()
        const now = Date.now()
        const remainingMs = targetTime - now
        const remainingSeconds = Math.ceil(remainingMs / 1000)

        // Warning state when <= 60 seconds remaining
        if (remainingSeconds <= 60 && remainingSeconds > 0) {
          setIsWarning(true)
          if (onWarning && !warningCalledRef.current) {
            warningCalledRef.current = true
            onWarning()
          }
        }

        // Check if countdown has expired (0:00) and call onExpire only once
        if (countdown === '0:00' && onExpire && !expiredCalledRef.current) {
          expiredCalledRef.current = true
          onExpire()
        }
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [type, time, onExpire, onWarning])

  const normalStyles = isWarning
    ? 'text-amber-400 bg-amber-500/20 border-amber-500/40 animate-pulse-warning'
    : 'text-teal-400 bg-teal-500/10 border-teal-500/20'

  if (size === 'large') {
    return (
      <div className={`flex items-center gap-3 backdrop-blur-sm px-4 py-3 rounded-xl border ${normalStyles}`}>
        <span className="text-gray-400 text-lg">{label}:</span>
        <span className={`font-mono font-bold text-2xl sm:text-3xl ${isWarning ? 'text-amber-400' : 'text-teal-400'}`}>{display}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border ${normalStyles}`}>
      <span className="text-gray-400">{label}:</span>
      <span className={`font-mono font-bold ${isWarning ? 'text-amber-400' : 'text-teal-400'}`}>{display}</span>
    </div>
  )
}
