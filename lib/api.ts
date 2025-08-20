// Tipos de datos para la API del backend

// Tipos de Autenticación
export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  passwordsMatch: boolean
}

export interface RegisterResponse {
  message: string
  expiresInMinutes: number
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  message?: string
}

export interface VerifyRegistrationRequest {
  email: string
  verificationCode: string
}

export interface ResetPasswordRequest {
  email: string
  verificationCode: string
  newPassword: string
  confirmPassword: string
  passwordsMatch: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

// Tipos para Sesiones
export interface AdminSession {
  id: number
  title: string
  sessionCode: string
  sessionLink: string
  qrCodeData: string
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT'
  questions: Question[]
  createdAt: string
  activatedAt: string | null
  closedAt: string | null
}

export interface CreateSessionRequest {
  title: string
  description: string
}

export interface VotingSession {
  id: number
  title: string
  sessionCode: string
  sessionLink: string
  qrCodeData: string
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT'
  questions: Question[]
  createdAt: string
  activatedAt: string | null
  closedAt: string | null
}

// Tipos para Preguntas
export interface Question {
  id: number
  questionText: string
  type: 'MULTIPLE_CHOICE' | 'TEXT'
  order: number
  sessionId?: number
  options?: QuestionOption[]
  totalVotes: number
  textResponses?: TextResponse[]
  createdAt?: string
  updatedAt?: string
}

export interface QuestionOption {
  id: number
  optionText: string
  order: number
  voteCount: number
  votePercentage: number
}

export interface TextResponse {
  response: string
  submittedAt: string
  voterIdentifier: string
  username?: string
}

export interface CreateQuestionRequest {
  questionText: string
  type: 'MULTIPLE_CHOICE' | 'TEXT'
  order: number
  options?: string[]
}

export interface UpdateQuestionRequest {
  questionText: string
  type: 'MULTIPLE_CHOICE' | 'TEXT'
  order: number
  options?: string[]
}

// Tipos para Votación
export interface VoteRequest {
  username: string
  optionId?: number
  textResponse?: string
  voterFingerprint: string
}

// Tipos para Usuario Temporal
export interface TempUser {
  id: string
  username: string
  sessionCode: string
  fingerprint: string
  createdAt: string
}

// Tipos para manejo de errores
export interface ApiError {
  message: string
  status?: number
  details?: any
}

// Clase personalizada para errores de API
export class ApiException extends Error {
  status: number
  details: any

  constructor(message: string, status: number = 500, details?: any) {
    super(message)
    this.name = 'ApiException'
    this.status = status
    this.details = details
  }
}

// Helper para hacer peticiones HTTP
export async function apiRequest<T>(
  url: string,
  options: RequestInit & { 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    requireAuth?: boolean
  }
): Promise<T> {
  try {
    console.log(`🚀 ${options.method} ${url}`)
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }

    // Agregar token de autenticación si es necesario
    if (options.requireAuth) {
      const token = localStorage.getItem('authToken')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    console.log(`📡 Response Status: ${response.status}`)

    const responseText = await response.text()
    console.log(`📥 Response:`, responseText)

    let data
    try {
      data = responseText ? JSON.parse(responseText) : {}
    } catch (parseError) {
      console.error('❌ Error parsing JSON:', parseError)
      throw new ApiException('Error parsing server response', response.status)
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP ${response.status}`
      console.error(`❌ API Error:`, errorMessage)
      throw new ApiException(errorMessage, response.status, data)
    }

    console.log(`✅ Success:`, data)
    return data
  } catch (error) {
    console.error('💥 Request failed:', error)
    
    if (error instanceof ApiException) {
      throw error
    }
    
    // Error de red o conexión
    throw new ApiException(
      'Error de conexión. Verifica que el backend esté funcionando.',
      0
    )
  }
}
