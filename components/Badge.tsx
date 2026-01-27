import { LucideIcon } from 'lucide-react'

interface BadgeProps {
  icon?: LucideIcon
  text: string
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export default function Badge({
  icon: Icon,
  text,
  variant = 'primary',
  size = 'md',
  animated = true,
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-700',
    success: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border-green-200 dark:border-green-700',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
    danger: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 border-red-200 dark:border-red-700',
  }

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} ${animated ? 'badge-pulse' : ''} hover-scale cursor-default`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span className="font-medium">{text}</span>
    </div>
  )
}
