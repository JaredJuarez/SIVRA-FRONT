"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, BarChart3, Plus, Home } from "lucide-react"
import { AuthService } from "@/lib/auth-service"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [mounted, setMounted] = useState(false)

  // Manejar hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkAuth = () => {
      try {
        const authStatus = AuthService.isAuthenticatedSync()
        console.log('🔍 [ADMIN_LAYOUT] Verificando autenticación:', authStatus)
        setIsAuthenticated(authStatus)
      } catch (error) {
        console.error('❌ [ADMIN_LAYOUT] Error verificando auth:', error)
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [mounted])

  const handleLogout = () => {
    AuthService.logout()
    console.log('👋 [ADMIN_LAYOUT] Cerrando sesión y redirigiendo')
    setIsAuthenticated(false)
    router.replace("/")
  }

  const handleGoToLogin = () => {
    router.replace("/")
  }

  // No renderizar nada hasta que esté montado
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  // Mostrar loading mientras se verifica autenticación
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Verificando autenticación...</div>
      </div>
    )
  }

  // Si no está autenticado, mostrar botón manual para ir al login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-lg text-red-600">⚠️ Acceso denegado</div>
          <div className="text-sm text-gray-600">No tienes permisos para acceder a esta página</div>
          <Button onClick={handleGoToLogin}>
            Ir al Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">SIVRA</span>
              </div>
              <nav className="hidden sm:flex items-center gap-4 ml-8">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/admin/dashboard")}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/admin/create")}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Sesión
                </Button>
              </nav>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
