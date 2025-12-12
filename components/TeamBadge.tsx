'use client'

interface TeamBadgeProps {
  name: string
  color: string
}

export default function TeamBadge({ name, color }: TeamBadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded text-sm font-medium"
      style={{
        backgroundColor: `${color}20`,
        borderLeft: `3px solid ${color}`,
        color: color
      }}
    >
      {name}
    </span>
  )
}
