import { 
  apiRequest, 
  RegisterRequest, 
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  VerifyRegistrationRequest,
  ResetPasswordRequest,
  ForgotPasswordRequest
} from './api'
import { config, buildUrl } from './config'

export class AuthService {
  // ===============================
  // REGISTRO Y VERIFICACIÓN
  // ===============================

  /**
   * Registra un nuevo administrador
   */
  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    console.log('👤 [AUTH_SERVICE] Registrando nuevo administrador:', data.email)
    
    return await apiRequest<RegisterResponse>(
      buildUrl(config.endpoints.register),
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    )
  }

  /**
   * Verifica el registro con el código de 6 dígitos
   */
  static async verifyRegistration(data: VerifyRegistrationRequest): Promise<LoginResponse> {
    console.log('✅ [AUTH_SERVICE] Verificando registro:', data.email)
    
    return await apiRequest<LoginResponse>(
      buildUrl(config.endpoints.verifyRegistration),
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    )
  }

  /**
   * Reenvía el código de verificación
   */
  static async resendCode(email: string): Promise<{ message: string }> {
    console.log('📧 [AUTH_SERVICE] Reenviando código:', email)
    
    return await apiRequest<{ message: string }>(
      buildUrl(config.endpoints.resendCode),
      {
        method: 'POST',
        body: JSON.stringify({ email })
      }
    )
  }

  // ===============================
  // AUTENTICACIÓN
  // ===============================

  /**
   * Autentica un administrador
   */
  static async login(data: LoginRequest): Promise<LoginResponse> {
    console.log('🔐 [AUTH_SERVICE] Autenticando administrador:', data.email)
    
    try {
      const response = await apiRequest<LoginResponse>(
        buildUrl(config.endpoints.login),
        {
          method: 'POST',
          body: JSON.stringify(data)
        }
      )

      // Guardar token en localStorage
      if (response.token && typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.token)
        localStorage.setItem('userEmail', data.email)
        console.log('✅ [AUTH_SERVICE] Token guardado en localStorage')
      }

      return response
    } catch (error) {
      // Modo de prueba cuando el backend no está disponible
      console.log('⚠️ [AUTH_SERVICE] Backend no disponible, usando modo de prueba')
      
      // Credenciales de prueba
      if (data.email === 'admin@eventos.com' && data.password === 'admin123') {
        const mockResponse: LoginResponse = {
          token: 'mock-jwt-token-' + Date.now(),
          message: 'Login exitoso (modo prueba)'
        }

        // Guardar token en localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', mockResponse.token)
          localStorage.setItem('userEmail', data.email)
          console.log('✅ [AUTH_SERVICE] Token de prueba guardado en localStorage')
        }

        return mockResponse
      } else {
        throw new Error('Credenciales incorrectas. Usa: admin@eventos.com / admin123')
      }
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  static logout(): void {
    if (typeof window === 'undefined') return
    console.log('👋 [AUTH_SERVICE] Cerrando sesión')
    localStorage.removeItem('authToken')
    localStorage.removeItem('userEmail')
  }

  /**
   * Verifica si el usuario está autenticado
   */
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('authToken')
    const isAuth = !!token
    console.log('🔍 [AUTH_SERVICE] Estado de autenticación:', isAuth, 'Token presente:', !!token)
    return isAuth
  }

  /**
   * Verifica si el usuario está autenticado de forma síncrona para evitar problemas de hidratación
   */
  static isAuthenticatedSync(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const token = localStorage.getItem('authToken')
      const email = localStorage.getItem('userEmail')
      const isAuth = !!(token && email && token.trim() !== '' && email.trim() !== '')
      
      console.log('🔍 [AUTH_SERVICE] Auth sync check:', { 
        hasToken: !!token, 
        hasEmail: !!email, 
        tokenLength: token ? token.length : 0,
        isAuth 
      })
      
      return isAuth
    } catch (error) {
      console.error('❌ [AUTH_SERVICE] Error checking auth:', error)
      return false
    }
  }

  /**
   * Obtiene el token de autenticación
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('authToken')
  }

  /**
   * Obtiene el email del usuario autenticado
   */
  static getUserEmail(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('userEmail')
  }

  // ===============================
  // RECUPERACIÓN DE CONTRASEÑA
  // ===============================

  /**
   * Inicia el proceso de recuperación de contraseña
   */
  static async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    console.log('🔑 [AUTH_SERVICE] Iniciando recuperación de contraseña:', data.email)
    
    return await apiRequest<{ message: string }>(
      buildUrl(config.endpoints.forgotPassword),
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    )
  }

  /**
   * Resetea la contraseña con el código de verificación
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    console.log('� [AUTH_SERVICE] Reseteando contraseña para:', data.email)
    
    return await apiRequest<{ message: string }>(
      buildUrl(config.endpoints.resetPassword),
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    )
  }
}
