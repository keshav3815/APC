import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/librarian',
  '/profile',
  '/my-donations',
  '/my-events',
]

// Routes that require admin role
const adminRoutes = ['/admin']

// Routes that require librarian role
const librarianRoutes = ['/librarian']

// Routes that are public (accessible without auth)
const publicRoutes = [
  '/', 
  '/about',
  '/mission',
  '/books',
  '/events', 
  '/donations',
  '/community',
  '/contact',
  '/volunteer',
  '/transparency',
  '/expenses',
  '/auth/signin', 
  '/auth/signup', 
  '/auth/forgot-password', 
  '/auth/reset-password'
]

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Check if path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isLibrarianRoute = librarianRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = pathname.startsWith('/auth/')
  const isPublicRoute = publicRoutes.includes(pathname)

  // If user is not logged in and trying to access protected routes
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and trying to access auth routes
  if (user && isAuthRoute && !pathname.includes('reset-password')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check role-based access
  if (user && (isAdminRoute || isLibrarianRoute)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (isAdminRoute && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (isLibrarianRoute && !['admin', 'librarian'].includes(profile?.role || '')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // For non-public routes, require authentication
  // Pages like /books, /events, /donations, /community should require sign-in
  const requiresAuth = !isPublicRoute && !isAuthRoute && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.includes('.')
  
  if (!user && requiresAuth && pathname !== '/') {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
