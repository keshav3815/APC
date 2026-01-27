import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  href?: string
  className?: string
  showText?: boolean
}

const sizeMap = {
  sm: { width: 40, height: 40 },
  md: { width: 50, height: 50 },
  lg: { width: 80, height: 80 },
  xl: { width: 120, height: 120 },
}

export default function Logo({
  size = 'md',
  href = '/',
  className = '',
  showText = false,
}: LogoProps) {
  const { width, height } = sizeMap[size]

  const logoContent = (
    <div className={`logo-container logo-${size} ${className}`}>
      <Image
        src="/images/apc.svg"
        alt="APC Logo"
        width={width}
        height={height}
        className="logo-image"
        priority
      />
      {showText && (
        <span className="ml-2 font-bold text-primary-600 dark:text-primary-400">
          APC
        </span>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{logoContent}</Link>
  }

  return logoContent
}
