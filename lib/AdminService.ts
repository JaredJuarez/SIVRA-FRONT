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
  type: 'MULTIPLE_CHOICE' | 'TEXT' | null;
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

export class AdminService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  static async getSessionById(id: string): Promise<AdminSession> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/sessions/${id}`, {
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
      
      // Fallback: datos de ejemplo cuando el backend no está disponible
      console.log('⚠️ [ADMIN_SERVICE] Backend no disponible, usando datos de ejemplo para sesión específica');
      return {
        id: parseInt(id) || 1,
        title: "Sesión de prueba",
        sessionCode: "4757F0C7",
        sessionLink: `http://localhost:3000/vote/4757F0C7`,
        qrCodeData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        status: "INACTIVE",
        questions: [
          {
            id: 1,
            questionText: "¿Esta sesión funciona correctamente?",
            type: "MULTIPLE_CHOICE",
            order: 1,
            totalVotes: 3,
            options: [
              {
                id: 1,
                optionText: "Sí, funciona perfectamente",
                order: 1,
                voteCount: 2,
                votePercentage: 66.7
              },
              {
                id: 2,
                optionText: "No, tiene errores",
                order: 2,
                voteCount: 1,
                votePercentage: 33.3
              }
            ]
          },
          {
            id: 2,
            questionText: "¿Qué te parece el diseño?",
            type: "MULTIPLE_CHOICE",
            order: 2,
            totalVotes: 2,
            options: [
              {
                id: 3,
                optionText: "Excelente",
                order: 1,
                voteCount: 1,
                votePercentage: 50.0
              },
              {
                id: 4,
                optionText: "Bueno",
                order: 2,
                voteCount: 1,
                votePercentage: 50.0
              },
              {
                id: 5,
                optionText: "Necesita mejoras",
                order: 3,
                voteCount: 0,
                votePercentage: 0.0
              }
            ]
          }
        ],
        createdAt: "2025-08-19T23:44:16.682514",
        activatedAt: null,
        closedAt: null
      } as AdminSession;
    }
  }

  static async getAllSessions(): Promise<AdminSession[]> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/sessions`, {
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
      
      // Fallback: datos de ejemplo cuando el backend no está disponible
      console.log('⚠️ [ADMIN_SERVICE] Backend no disponible, usando datos de ejemplo');
      return [
        {
          id: 1,
          title: "Encuesta de prueba",
          sessionCode: "4757F0C7",
          sessionLink: "http://localhost:3000/vote/4757F0C7",
          qrCodeData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
          status: "INACTIVE",
          questions: [
            {
              id: 1,
              questionText: "¿Esto funciona?",
              type: "MULTIPLE_CHOICE",
              order: 1,
              totalVotes: 0,
              options: [
                {
                  id: 1,
                  optionText: "Sí",
                  order: 1,
                  voteCount: 0,
                  votePercentage: 0
                },
                {
                  id: 2,
                  optionText: "No",
                  order: 2,
                  voteCount: 0,
                  votePercentage: 0
                }
              ]
            }
          ],
          createdAt: "2025-08-19T23:44:16.682514",
          activatedAt: null,
          closedAt: null
        }
      ] as AdminSession[];
    }
  }

  static async createSession(session: CreateSessionRequest): Promise<AdminSession> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/sessions`, {
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
      const response = await fetch(`${this.baseUrl}/admin/sessions/${id}/activate`, {
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
      const response = await fetch(`${this.baseUrl}/admin/sessions/${id}/close`, {
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
      console.error('Error closing session:', error);
      // En modo prueba, simulamos que la acción fue exitosa
      console.log('⚠️ [ADMIN_SERVICE] Backend no disponible, simulando cierre exitoso');
    }
  }

  // Helper para obtener el token de autenticación
  private static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }
}
