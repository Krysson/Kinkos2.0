import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))
  const isProtectedRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/profile')
  const isAdminRoute = pathname.startsWith('/admin')

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to login
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check admin role for admin routes
  if (user && isAdminRoute) {
    const { data: member } = await supabase.from('members').select('role').eq('auth_id', user.id).single()

    if (!member || !['admin', 'owner'].includes(member.role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - images and other static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
