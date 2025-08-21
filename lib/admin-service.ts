import { apiRequest, AdminSession, CreateSessionRequest, CreateQuestionRequest, UpdateQuestionRequest, Question } from './api'
import { config, buildUrl } from './config'

export class AdminService {
  // ===============================
  // GESTIÓN DE SESIONES
  // ===============================

  /**
   * Obtiene todas las sesiones del administrador autenticado
   */
  static async getSessions(): Promise<AdminSession[]> {
    console.log('📋 [ADMIN_SERVICE] Obteniendo sesiones del admin...')
    
    return await apiRequest<AdminSession[]>(
      buildUrl(config.endpoints.sessions),
      {
        method: 'GET',
        requireAuth: true
      }
    )
  }

  /**
   * Obtiene una sesión específica por ID
   */
  static async getSessionById(sessionId: number): Promise<AdminSession> {
    console.log(`🔍 [ADMIN_SERVICE] Obteniendo sesión: ${sessionId}`)
    
    return await apiRequest<AdminSession>(
      buildUrl(config.endpoints.sessionById(sessionId)),
      {
        method: 'GET',
        requireAuth: true
      }
    )
  }

  /**
   * Crea una nueva sesión de votación
   */
  static async createSession(sessionData: CreateSessionRequest): Promise<AdminSession> {
    console.log('✨ [ADMIN_SERVICE] Creando nueva sesión:', sessionData.title)
    
    return await apiRequest<AdminSession>(
      buildUrl(config.endpoints.sessions),
      {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(sessionData)
      }
    )
  }

  /**
   * Activa una sesión de votación
   */
  static async activateSession(sessionId: number): Promise<AdminSession> {
    console.log(`▶️ [ADMIN_SERVICE] Activando sesión: ${sessionId}`)
    
    return await apiRequest<AdminSession>(
      buildUrl(config.endpoints.activateSession(sessionId)),
      {
        method: 'POST',
        requireAuth: true
      }
    )
  }

  /**
   * Cierra una sesión de votación
   */
  static async closeSession(sessionId: number): Promise<AdminSession> {
    console.log(`⏹️ [ADMIN_SERVICE] Cerrando sesión: ${sessionId}`)
    
    return await apiRequest<AdminSession>(
      buildUrl(config.endpoints.closeSession(sessionId)),
      {
        method: 'POST',
        requireAuth: true
      }
    )
  }

  /**
   * Actualiza el estado de una sesión (activar/cerrar)
   */
  static async updateSessionStatus(sessionId: number, status: 'ACTIVE' | 'CLOSED'): Promise<AdminSession> {
    console.log(`🔄 [ADMIN_SERVICE] Cambiando estado de sesión ${sessionId} a ${status}`)
    
    if (status === 'ACTIVE') {
      return await this.activateSession(sessionId)
    } else {
      return await this.closeSession(sessionId)
    }
  }

  // ===============================
  // GESTIÓN DE PREGUNTAS
  // ===============================

  /**
   * Obtiene todas las preguntas de una sesión
   */
  static async getQuestions(sessionId: number): Promise<Question[]> {
    console.log(`❓ [ADMIN_SERVICE] Obteniendo preguntas de sesión: ${sessionId}`)
    
    return await apiRequest<Question[]>(
      buildUrl(config.endpoints.questions(sessionId)),
      {
        method: 'GET',
        requireAuth: true
      }
    )
  }

  /**
   * Obtiene una pregunta específica
   */
  static async getQuestion(sessionId: number, questionId: number): Promise<Question> {
    console.log(`🔍 [ADMIN_SERVICE] Obteniendo pregunta: ${questionId} de sesión: ${sessionId}`)
    
    return await apiRequest<Question>(
      buildUrl(config.endpoints.questionById(sessionId, questionId)),
      {
        method: 'GET',
        requireAuth: true
      }
    )
  }

  /**
   * Crea una nueva pregunta en la sesión
   */
  static async createQuestion(sessionId: number, questionData: CreateQuestionRequest): Promise<Question> {
    console.log(`➕ [ADMIN_SERVICE] Creando pregunta en sesión ${sessionId}:`, questionData.questionText)
    
    return await apiRequest<Question>(
      buildUrl(config.endpoints.questions(sessionId)),
      {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(questionData)
      }
    )
  }

  /**
   * Actualiza una pregunta existente
   */
  static async updateQuestion(sessionId: number, questionId: number, questionData: UpdateQuestionRequest): Promise<Question> {
    console.log(`📝 [ADMIN_SERVICE] Actualizando pregunta ${questionId} en sesión ${sessionId}`)
    
    return await apiRequest<Question>(
      buildUrl(config.endpoints.questionById(sessionId, questionId)),
      {
        method: 'PUT',
        requireAuth: true,
        body: JSON.stringify(questionData)
      }
    )
  }

  /**
   * Elimina una pregunta
   */
  static async deleteQuestion(sessionId: number, questionId: number): Promise<void> {
    console.log(`🗑️ [ADMIN_SERVICE] Eliminando pregunta ${questionId} de sesión ${sessionId}`)
    
    await apiRequest<void>(
      buildUrl(config.endpoints.questionById(sessionId, questionId)),
      {
        method: 'DELETE',
        requireAuth: true
      }
    )
  }

  /**
   * Reordena las preguntas de una sesión
   */
  static async reorderQuestions(sessionId: number, questionIds: number[]): Promise<Question[]> {
    console.log(`🔄 [ADMIN_SERVICE] Reordenando preguntas de sesión ${sessionId}:`, questionIds)
    
    return await apiRequest<Question[]>(
      buildUrl(config.endpoints.reorderQuestions(sessionId)),
      {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(questionIds)
      }
    )
  }
}
