// Configuración centralizada del backend
export const config = {
  // URL base del backend - CAMBIAR AQUÍ PARA DIFERENTES ENTORNOS
  backendUrl: 'http://localhost:8080/api',
  
  // Configuración de endpoints
  endpoints: {
    // Autenticación
    register: '/auth/register',
    login: '/auth/login',
    verifyRegistration: '/auth/verify-registration',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    resendCode: '/auth/resend-code',
    
    // Administración
    sessions: '/admin/sessions',
    sessionById: (id: number) => `/admin/sessions/${id}`,
    closeSession: (id: number) => `/admin/sessions/${id}/close`,
    activateSession: (id: number) => `/admin/sessions/${id}/activate`,
    
    // Preguntas
    questions: (sessionId: number) => `/sessions/${sessionId}/questions`,
    questionById: (sessionId: number, questionId: number) => `/sessions/${sessionId}/questions/${questionId}`,
    reorderQuestions: (sessionId: number) => `/sessions/${sessionId}/questions/reorder`,
    
    // Votación Pública
    votingSession: (sessionCode: string) => `/vote/${sessionCode}`,
    votingQuestion: (sessionCode: string, questionId: number) => `/vote/${sessionCode}/question/${questionId}`,
    submitVote: (sessionCode: string) => `/vote/${sessionCode}`,
    submitQuestionVote: (sessionCode: string, questionId: number) => `/vote/${sessionCode}/questions/${questionId}`,
  }
}

// Helper para construir URLs completas
export const buildUrl = (endpoint: string): string => {
  return `${config.backendUrl}${endpoint}`
}

// Helper para debug
export const logApiCall = (method: string, url: string, data?: any) => {
  console.log(`🌐 API ${method}:`, url)
  if (data) {
    console.log('📤 Data:', data)
  }
}
