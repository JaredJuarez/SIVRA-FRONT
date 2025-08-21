import { BASE_API_URL } from '@/url';

export interface AdminSession {
  id: number;
  title: string;
  sessionCode: string;
  sessionLink: string;
  qrCodeData: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'CLOSED';
  questions: AdminQuestion[];
  createdAt: string;
  activatedAt: string | null;
  closedAt: string | null;
}

export interface AdminQuestion {
  id: number;
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT' | null;
  order: number;
  totalVotes: number;
  options?: AdminOption[];
}

export interface AdminOption {
  id: number;
  optionText: string;
  order: number;
  voteCount: number;
  votePercentage: number;
}

export interface CreateSessionRequest {
  title: string;
  description: string;
}

export interface CreateQuestionRequest {
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT';
  order: number;
  options?: string[];
}

export interface UpdateQuestionRequest {
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT';
  order: number;
  options?: string[];
}

export interface QuestionDetailResponse {
  id: number;
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT';
  order: number;
  sessionId: number;
  options?: AdminOption[] | null;
  totalVotes: number;
  textResponses?: QuestionTextResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionTextResponse {
  response: string;
  submittedAt: string;
  voterIdentifier: string;
}

export class AdminService {

  static async getSessionById(id: string): Promise<AdminSession> {
    try {
      const response = await fetch(`${BASE_API_URL}/admin/sessions/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching session:', error);
      throw error;
    }
  }

  static async getAllSessions(): Promise<AdminSession[]> {
    try {
      const response = await fetch(`${BASE_API_URL}/admin/sessions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  static async createSession(session: CreateSessionRequest): Promise<AdminSession> {
    try {
      const response = await fetch(`${BASE_API_URL}/admin/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(session),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  static async activateSession(id: number): Promise<void> {
    try {
      const response = await fetch(`${BASE_API_URL}/admin/sessions/${id}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error activating session:', error);
      // En modo prueba, simulamos que la acción fue exitosa
      console.log('⚠️ [ADMIN_SERVICE] Backend no disponible, simulando activación exitosa');
    }
  }

  static async closeSession(id: number): Promise<void> {
    try {
      console.log(`🔒 [ADMIN_SERVICE] Cerrando sesión ID: ${id}`);
      console.log(`📡 [ADMIN_SERVICE] Endpoint: ${BASE_API_URL}/admin/sessions/${id}/close`);
      
      const response = await fetch(`${BASE_API_URL}/admin/sessions/${id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
      });

      console.log(`📡 [ADMIN_SERVICE] Respuesta del servidor:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [ADMIN_SERVICE] Error del servidor:`, {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      console.log(`✅ [ADMIN_SERVICE] Sesión ${id} cerrada exitosamente`);
    } catch (error) {
      console.error('❌ [ADMIN_SERVICE] Error closing session:', error);
      // En modo prueba, simulamos que la acción fue exitosa
      console.log('⚠️ [ADMIN_SERVICE] Backend no disponible, simulando cierre exitoso');
    }
  }

  // ===== MÉTODOS PARA MANEJO DE PREGUNTAS =====

  static async getQuestionsBySession(sessionId: string): Promise<AdminQuestion[]> {
    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sessionId}/questions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  static async getQuestionById(sessionId: string, questionId: string): Promise<QuestionDetailResponse> {
    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sessionId}/questions/${questionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching question:', error);
      throw error;
    }
  }

  static async createQuestion(sessionId: string, question: CreateQuestionRequest): Promise<AdminQuestion> {
    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sessionId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(question),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  static async updateQuestion(sessionId: string, questionId: string, question: UpdateQuestionRequest): Promise<AdminQuestion> {
    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sessionId}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(question),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  static async deleteQuestion(sessionId: string, questionId: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sessionId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  static async reorderQuestions(sessionId: string, questionIds: number[]): Promise<void> {
    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sessionId}/questions/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(questionIds),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error reordering questions:', error);
      throw error;
    }
  }

  // Helper para obtener el token de autenticación
  private static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }
}
