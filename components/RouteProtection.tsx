'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface RouteProtectionProps {
  children: React.ReactNode
}

// Pages that require authentication
const protectedPages = [
  '/community',
  '/books',
  '/transparency',
  '/expenses',
  '/events',
  '/volunteer',
  '/dashboard',
  '/admin',
  '/librarian',
]

// Pages that are always public (no auth required)
const publicPages = [
  '/',
  '/about',
  '/contact',
  '/mission',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
]

export default function RouteProtection({ children }: RouteProtectionProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Wait for auth to load
    if (loading) return

    // Check if current path requires authentication
    const isProtectedPage = protectedPages.some(page => pathname.startsWith(page))
    const isPublicPage = publicPages.some(page => pathname === page || pathname.startsWith(page))

    // If page is protected and user is not logged in, redirect to signup
    if (isProtectedPage && !user) {
      const redirectUrl = `/auth/signup?redirect=${encodeURIComponent(pathname)}`
      router.push(redirectUrl)
    }
  }, [user, loading, pathname, router])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if current page is protected
  const isProtectedPage = protectedPages.some(page => pathname.startsWith(page))
  
  // If page is protected and no user, show nothing (will redirect)
  if (isProtectedPage && !user) {
    return null
  }

  return <>{children}</>
}
