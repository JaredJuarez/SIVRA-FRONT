export interface CreateQuestionRequest {
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'TEXT';
  order: number;
  options?: string[]; // Array de strings para opciones de opción múltiple
}

export interface UpdateQuestionRequest {
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'TEXT';
  order: number;
  options?: string[];
}

export interface QuestionOption {
  id: number;
  optionText: string;
  order: number;
  voteCount: number;
  votePercentage: number;
}

export interface TextResponse {
  response: string;
  submittedAt: string;
  voterIdentifier: string;
}

export interface QuestionDetail {
  id: number;
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'TEXT';
  order: number;
  sessionId: number;
  options?: QuestionOption[];
  totalVotes: number;
  textResponses?: TextResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionSummary {
  id: number;
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'TEXT';
  order: number;
  options?: QuestionOption[];
  totalVotes: number;
}

export class QuestionService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  // Obtener todas las preguntas de una sesión
  static async getSessionQuestions(sessionId: number): Promise<QuestionSummary[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/questions`, {
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
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Error fetching session questions:', error);
      console.log('⚠️ [QUESTION_SERVICE] Backend no disponible, usando datos de ejemplo');
      
      // Datos de ejemplo
      return [
        {
          id: 1,
          questionText: "¿Cuál es tu color favorito?",
          type: "MULTIPLE_CHOICE",
          order: 1,
          options: [
            {
              id: 1,
              optionText: "Azul",
              order: 1,
              voteCount: 25,
              votePercentage: 65.5
            },
            {
              id: 2,
              optionText: "Rojo",
              order: 2,
              voteCount: 13,
              votePercentage: 34.5
            }
          ],
          totalVotes: 38
        }
      ];
    }
  }

  // Obtener detalle de una pregunta específica
  static async getQuestionDetail(sessionId: number, questionId: number): Promise<QuestionDetail> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/questions/${questionId}`, {
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
      console.error('Error fetching question detail:', error);
      throw error;
    }
  }

  // Crear una nueva pregunta
  static async createQuestion(sessionId: number, questionData: CreateQuestionRequest): Promise<QuestionDetail> {
    try {
      console.log(`➕ [QUESTION_SERVICE] Creando pregunta en sesión ${sessionId}:`, questionData);
      
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [QUESTION_SERVICE] Pregunta creada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('❌ [QUESTION_SERVICE] Error creating question:', error);
      throw error;
    }
  }

  // Actualizar una pregunta existente
  static async updateQuestion(sessionId: number, questionId: number, questionData: UpdateQuestionRequest): Promise<QuestionDetail> {
    try {
      console.log(`🔄 [QUESTION_SERVICE] Actualizando pregunta ${questionId} en sesión ${sessionId}:`, questionData);
      
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [QUESTION_SERVICE] Pregunta actualizada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('❌ [QUESTION_SERVICE] Error updating question:', error);
      throw error;
    }
  }

  // Eliminar una pregunta
  static async deleteQuestion(sessionId: number, questionId: number): Promise<void> {
    try {
      console.log(`🗑️ [QUESTION_SERVICE] Eliminando pregunta ${questionId} de sesión ${sessionId}`);
      
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      console.log('✅ [QUESTION_SERVICE] Pregunta eliminada exitosamente');
    } catch (error) {
      console.error('❌ [QUESTION_SERVICE] Error deleting question:', error);
      throw error;
    }
  }

  // Reordenar preguntas
  static async reorderQuestions(sessionId: number, questionIds: number[]): Promise<void> {
    try {
      console.log(`🔀 [QUESTION_SERVICE] Reordenando preguntas de sesión ${sessionId}:`, questionIds);
      
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/questions/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(questionIds),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      console.log('✅ [QUESTION_SERVICE] Preguntas reordenadas exitosamente');
    } catch (error) {
      console.error('❌ [QUESTION_SERVICE] Error reordering questions:', error);
      throw error;
    }
  }

  // Helper para obtener el token de autenticación
  private static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }
}
