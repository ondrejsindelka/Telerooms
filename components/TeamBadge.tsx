'use client'

interface TeamBadgeProps {
  name: string
  color: string
  size?: 'small' | 'normal'
}

export default function TeamBadge({ name, color, size = 'normal' }: TeamBadgeProps) {
  const sizeClasses = size === 'small'
    ? 'px-1.5 py-0.5 rounded-md text-[10px] max-w-[80px]'
    : 'px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm max-w-[120px] sm:max-w-none'

  return (
    <span
      className={`inline-flex items-center font-medium truncate backdrop-blur-sm ${sizeClasses}`}
      style={{
        backgroundColor: `${color}20`,
        borderLeft: `3px solid ${color}`,
        color: color
      }}
      title={name}
    >
      {name}
    </span>
  )
}
