import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  // Solo aplicar middleware a rutas de administrador
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // En el middleware no podemos acceder a localStorage directamente
    // Así que permitimos que el componente AdminLayout maneje la verificación
    console.log('🔐 Middleware: Acceso a ruta admin:', request.nextUrl.pathname)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
