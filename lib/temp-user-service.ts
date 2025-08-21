import { TempUser } from './api'

export class TempUserService {
  private static readonly STORAGE_KEY = 'tempUser'
  private static readonly SESSION_KEY = 'tempUserSession'

  /**
   * Genera un fingerprint único basado en características del navegador
   */
  static generateFingerprint(): string {
    if (typeof window === 'undefined') {
      return `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx!.textBaseline = 'top'
    ctx!.font = '14px Arial'
    ctx!.fillText('Browser fingerprint', 2, 2)
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')
    
    // Crear hash simple del fingerprint
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36)
  }

  /**
   * Crea un usuario temporal para una sesión específica
   */
  static createTempUser(username: string, sessionCode: string): TempUser {
    console.log(`👤 [TEMP_USER_SERVICE] Creando usuario temporal: ${username} para sesión: ${sessionCode}`)
    
    const fingerprint = this.generateFingerprint()
    const tempUser: TempUser = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: username.trim(),
      sessionCode,
      fingerprint,
      createdAt: new Date().toISOString()
    }

    // Guardar en localStorage para la sesión actual
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tempUser))
      localStorage.setItem(this.SESSION_KEY, sessionCode)
    }
    
    console.log(`✅ [TEMP_USER_SERVICE] Usuario temporal creado:`, tempUser)
    return tempUser
  }

  /**
   * Obtiene el usuario temporal actual
   */
  static getCurrentTempUser(): TempUser | null {
    if (typeof window === 'undefined') return null
    
    try {
      const userData = localStorage.getItem(this.STORAGE_KEY)
      if (!userData) {
        console.log(`ℹ️ [TEMP_USER_SERVICE] No hay usuario temporal guardado`)
        return null
      }

      const tempUser = JSON.parse(userData) as TempUser
      console.log(`🔍 [TEMP_USER_SERVICE] Usuario temporal encontrado:`, tempUser.username)
      return tempUser
    } catch (error) {
      console.error('❌ [TEMP_USER_SERVICE] Error obteniendo usuario temporal:', error)
      return null
    }
  }

  /**
   * Verifica si hay un usuario temporal para una sesión específica
   */
  static hasTempUserForSession(sessionCode: string): boolean {
    if (typeof window === 'undefined') return false
    
    const currentUser = this.getCurrentTempUser()
    const currentSession = localStorage.getItem(this.SESSION_KEY)
    
    const hasUser = currentUser && 
                   currentSession === sessionCode && 
                   currentUser.sessionCode === sessionCode
    
    console.log(`🔍 [TEMP_USER_SERVICE] ¿Usuario temporal para ${sessionCode}?`, hasUser)
    return !!hasUser
  }

  /**
   * Limpia el usuario temporal actual
   */
  static clearTempUser(): void {
    if (typeof window === 'undefined') return
    console.log(`🧹 [TEMP_USER_SERVICE] Limpiando usuario temporal`)
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.SESSION_KEY)
  }

  /**
   * Obtiene el fingerprint del usuario actual
   */
  static getCurrentFingerprint(): string {
    const currentUser = this.getCurrentTempUser()
    if (currentUser) {
      return currentUser.fingerprint
    }
    return this.generateFingerprint()
  }

  /**
   * Verifica si la sesión temporal ha expirado (más de 2 horas)
   */
  static isTempUserExpired(): boolean {
    const currentUser = this.getCurrentTempUser()
    if (!currentUser) return true

    const createdAt = new Date(currentUser.createdAt)
    const now = new Date()
    const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    
    const expired = diffHours > 2
    console.log(`⏰ [TEMP_USER_SERVICE] Usuario temporal expirado (${diffHours.toFixed(1)}h):`, expired)
    
    if (expired) {
      this.clearTempUser()
    }
    
    return expired
  }

  /**
   * Renueva el timestamp del usuario temporal
   */
  static renewTempUser(): void {
    if (typeof window === 'undefined') return
    
    const currentUser = this.getCurrentTempUser()
    if (currentUser) {
      currentUser.createdAt = new Date().toISOString()
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentUser))
      console.log(`🔄 [TEMP_USER_SERVICE] Usuario temporal renovado`)
    }
  }
}
