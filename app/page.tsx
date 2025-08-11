"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Vote, Users, BarChart3 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { login, isLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Redirigir si ya está autenticado
  useEffect(() => {
    console.log('🏠 Login Page: Auth state changed:', { isAuthenticated });
    if (isAuthenticated) {
      console.log('✈️ Login Page: Redirecting to dashboard...');
      router.push("/admin/dashboard")
    }
  }, [isAuthenticated, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('🚀 Login Page: Starting login process...');
      await login(email, password)
      console.log('✅ Login Page: Login successful, showing toast...');
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      })
      console.log('📍 Login Page: Attempting manual redirect...');
      router.push("/admin/dashboard")
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: "Credenciales incorrectas. Verifica tu email y contraseña.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Vote className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SIVRA</h1>
          <p className="text-gray-600">Gestiona encuestas y votaciones en tiempo real</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acceso de Administrador</CardTitle>
            <CardDescription>Inicia sesión para gestionar tus eventos y votaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@eventos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">Credenciales de prueba:</p>
              <p className="text-sm text-blue-700">Email: admin@eventos.com</p>
              <p className="text-sm text-blue-700">Contraseña: admin123</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Users className="w-8 h-8 text-indigo-600 mb-2" />
            <p className="text-sm text-gray-600">Sin registro para participantes</p>
          </div>
          <div className="flex flex-col items-center">
            <BarChart3 className="w-8 h-8 text-indigo-600 mb-2" />
            <p className="text-sm text-gray-600">Resultados en tiempo real</p>
          </div>
          <div className="flex flex-col items-center">
            <Vote className="w-8 h-8 text-indigo-600 mb-2" />
            <p className="text-sm text-gray-600">Fácil de usar en móviles</p>
          </div>
        </div>
      </div>
    </div>
  )
}
