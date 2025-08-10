import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Obtener el token del localStorage (en el cliente) o cookies
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Rutas que requieren autenticación
  const protectedPaths = ['/admin']
  
  // Verificar si la ruta actual requiere autenticación
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Si es una ruta protegida y no hay token, redirigir al login
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Si hay token y está tratando de acceder al login, redirigir al dashboard
  if (token && request.nextUrl.pathname === '/') {
    const dashboardUrl = new URL('/admin/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Aplicar a todas las rutas excepto las estáticas
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
