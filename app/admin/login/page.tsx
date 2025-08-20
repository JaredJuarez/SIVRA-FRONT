"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Vote, Users, BarChart3, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { AuthService } from "@/lib/auth-service"
import Link from "next/link"

export default function AuthPage() {
  const router = useRouter()
  
  // Estados para Login
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState("")

  // Estados para Registro
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerError, setRegisterError] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState("")

  // Estados para Verificación
  const [verificationCode, setVerificationCode] = useState("")
  const [showVerification, setShowVerification] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const clearAuthData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userEmail')
      console.log('🧹 [AUTH_PAGE] Auth data cleared')
      setLoginError('Datos de autenticación limpiados. Intenta hacer login nuevamente.')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError("")

    try {
      console.log('🔐 Iniciando login...')
      const response = await AuthService.login({
        email: loginEmail,
        password: loginPassword
      })
      
      console.log('✅ Login exitoso:', response)
      
      // Mostrar mensaje de éxito
      setLoginError("")
      
      // Redirigir inmediatamente usando replace para evitar problemas de historial
      console.log('🚀 Redirigiendo al dashboard...')
      router.replace("/admin/dashboard")
      
    } catch (error: any) {
      console.error('❌ Error en login:', error)
      setLoginError(error.message || 'Error al iniciar sesión')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegistering(true)
    setRegisterError("")
    setRegisterSuccess("")

    // Validaciones
    if (registerPassword !== confirmPassword) {
      setRegisterError("Las contraseñas no coinciden")
      setIsRegistering(false)
      return
    }

    if (registerPassword.length < 6) {
      setRegisterError("La contraseña debe tener al menos 6 caracteres")
      setIsRegistering(false)
      return
    }

    try {
      console.log('📝 Iniciando registro...')
      const response = await AuthService.register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        confirmPassword: confirmPassword,
        passwordsMatch: registerPassword === confirmPassword
      })
      
      console.log('✅ Registro exitoso:', response)
      setRegisterSuccess(`Código de verificación enviado a: ${response.email}`)
      setPendingEmail(response.email)
      setShowVerification(true)
      
    } catch (error: any) {
      console.error('❌ Error en registro:', error)
      setRegisterError(error.message || 'Error al registrar usuario')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)

    try {
      console.log('🔍 Verificando código...')
      await AuthService.verifyRegistration({
        email: pendingEmail,
        verificationCode: verificationCode
      })
      
      console.log('✅ Verificación exitosa')
      setRegisterSuccess("¡Cuenta verificada exitosamente! Ahora puedes iniciar sesión.")
      setShowVerification(false)
      setVerificationCode("")
      
      // Limpiar formulario de registro
      setRegisterName("")
      setRegisterEmail("")
      setRegisterPassword("")
      setConfirmPassword("")
      
    } catch (error: any) {
      console.error('❌ Error en verificación:', error)
      setRegisterError(error.message || 'Error al verificar código')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Vote className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SIVRA Admin</h1>
          <p className="text-gray-600">Gestiona encuestas y votaciones en tiempo real</p>
        </div>

        {/* Back to Home */}
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Administración</CardTitle>
            <CardDescription>Inicia sesión o crea una cuenta para gestionar votaciones</CardDescription>
          </CardHeader>
          <CardContent>
            {showVerification ? (
              // Formulario de Verificación
              <form onSubmit={handleVerification} className="space-y-4">
                <div className="text-center mb-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Verifica tu cuenta</h3>
                  <p className="text-sm text-gray-600">
                    Ingresa el código de 6 dígitos enviado a:
                  </p>
                  <p className="text-sm font-medium text-blue-600">{pendingEmail}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Código de Verificación</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>

                {registerError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{registerError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isVerifying}>
                  {isVerifying ? "Verificando..." : "Verificar Cuenta"}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowVerification(false)
                    setRegisterError("")
                    setVerificationCode("")
                  }}
                >
                  Volver al registro
                </Button>
              </form>
            ) : (
              // Formularios de Login y Registro
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="register">Crear Cuenta</TabsTrigger>
                </TabsList>
                
                {/* TAB LOGIN */}
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="loginEmail">Correo electrónico</Label>
                      <Input
                        id="loginEmail"
                        type="email"
                        placeholder="admin@ejemplo.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loginPassword">Contraseña</Label>
                      <Input
                        id="loginPassword"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>

                    {loginError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{loginError}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoggingIn}>
                      {isLoggingIn ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </Button>
                  </form>
                </TabsContent>
                
                {/* TAB REGISTER */}
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="registerName">Nombre completo</Label>
                      <Input
                        id="registerName"
                        type="text"
                        placeholder="Juan Pérez"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerEmail">Correo electrónico</Label>
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="juan@ejemplo.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerPassword">Contraseña</Label>
                      <Input
                        id="registerPassword"
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    {registerError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{registerError}</AlertDescription>
                      </Alert>
                    )}

                    {registerSuccess && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription className="text-green-700">
                          {registerSuccess}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full" disabled={isRegistering}>
                      {isRegistering ? "Creando cuenta..." : "Crear Cuenta"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Credenciales de prueba */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Credenciales de Prueba</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Email:</span> admin@eventos.com</div>
              <div><span className="font-medium">Contraseña:</span> admin123</div>
            </div>
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAuthData}
                className="w-full text-xs"
              >
                🧹 Limpiar Datos de Autenticación
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
          <div className="font-bold mb-1">🐛 Debug Info:</div>
          <div>Backend URL: http://localhost:8080</div>
          <div>Auth Token: {AuthService.getToken() ? '✅ Presente' : '❌ No presente'}</div>
          <div>Usuario: {AuthService.getUserEmail() || 'No autenticado'}</div>
          <div>Verificación pendiente: {showVerification ? 'Sí' : 'No'}</div>
        </div>

        {/* Features */}
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
