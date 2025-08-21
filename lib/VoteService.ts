import { BASE_API_URL } from '@/url';

export interface VoteSession {
  id: number;
  title: string;
  sessionCode: string;
  sessionLink: string;
  qrCodeData: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'CLOSED';
  questions: VoteQuestion[];
  createdAt: string;
  activatedAt: string | null;
  closedAt: string | null;
}

export interface VoteQuestion {
  id: number;
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT';
  order: number;
  totalVotes: number;
  options?: VoteOption[];
}

export interface VoteOption {
  id: number;
  optionText: string;
  order: number;
  voteCount: number;
  votePercentage: number;
}

export interface VoteRequest {
  username: string;
  optionId?: number;
  textResponse?: string;
  voterFingerprint: string;
}

export interface VoteResponse {
  success: boolean;
  message: string;
}

export class VoteService {
  private static baseUrl = BASE_API_URL;

  // Obtener sesión de votación por código
  static async getVotingSession(sessionCode: string): Promise<VoteSession> {
    try {
      const response = await fetch(`${this.baseUrl}/vote/${sessionCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching voting session:', error);
      throw error;
    }
  }

  // Obtener pregunta específica
  static async getQuestion(sessionCode: string, questionId: number): Promise<VoteQuestion> {
    try {
      const response = await fetch(`${this.baseUrl}/vote/${sessionCode}/question/${questionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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

  // Enviar voto
  static async submitVote(sessionCode: string, voteData: VoteRequest): Promise<VoteResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/vote/${sessionCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  }

  // Enviar voto para pregunta específica
  static async submitQuestionVote(sessionCode: string, questionId: number, voteData: VoteRequest): Promise<VoteResponse> {
    try {
      const endpoint = `${this.baseUrl}/vote/${sessionCode}/questions/${questionId}`;
      
      console.log('🔄 [VOTE_SERVICE] Enviando voto:', {
        endpoint,
        sessionCode,
        questionId,
        voteData,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      });

      console.log('📡 [VOTE_SERVICE] Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [VOTE_SERVICE] Error del servidor:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [VOTE_SERVICE] Voto enviado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('❌ [VOTE_SERVICE] Error submitting question vote:', error);
      throw error;
    }
  }

  // Generar fingerprint único del votante
  static generateVoterFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Fingerprint test', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36);
  }
}
