// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // Ruta pública: login
  if (pathname === '/login') {
    if (user) return NextResponse.redirect(new URL('/', request.url))
    return supabaseResponse
  }

  // Sin sesión → login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Obtener rol del usuario
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (!usuario || !usuario.rol) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  const rol = usuario.rol

  // Gerente solo puede acceder a /dashboard
  if (rol === 'gerente' && !pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Vendedor no puede acceder a /dashboard
  if (rol === 'vendedor' && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/panel', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
