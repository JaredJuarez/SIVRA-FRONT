import { apiRequest, VotingSession, VoteRequest, Question } from './api'
import { config, buildUrl } from './config'

export class VoteService {
  // ===============================
  // VOTACIÓN PÚBLICA
  // ===============================

  /**
   * Obtiene la sesión de votación para participantes
   */
  static async getVotingSession(sessionCode: string): Promise<VotingSession> {
    console.log(`🗳️ [VOTE_SERVICE] Obteniendo sesión de votación: ${sessionCode}`)
    
    return await apiRequest<VotingSession>(
      buildUrl(config.endpoints.votingSession(sessionCode)),
      {
        method: 'GET'
      }
    )
  }

  /**
   * Obtiene una pregunta específica de la sesión de votación
   */
  static async getQuestion(sessionCode: string, questionId: number): Promise<Question> {
    console.log(`❓ [VOTE_SERVICE] Obteniendo pregunta ${questionId} de sesión: ${sessionCode}`)
    
    return await apiRequest<Question>(
      buildUrl(config.endpoints.votingQuestion(sessionCode, questionId)),
      {
        method: 'GET'
      }
    )
  }

  /**
   * Envía un voto para una pregunta específica
   */
  static async submitQuestionVote(sessionCode: string, questionId: number, voteData: VoteRequest): Promise<{ message: string }> {
    console.log(`✍️ [VOTE_SERVICE] Enviando voto para pregunta ${questionId} en sesión ${sessionCode}`)
    console.log(`👤 [VOTE_SERVICE] Usuario: ${voteData.username}`)
    
    return await apiRequest<{ message: string }>(
      buildUrl(config.endpoints.submitQuestionVote(sessionCode, questionId)),
      {
        method: 'POST',
        body: JSON.stringify(voteData)
      }
    )
  }

  /**
   * Envía un voto general para la sesión (endpoint alternativo)
   */
  static async submitVote(sessionCode: string, voteData: VoteRequest): Promise<{ message: string }> {
    console.log(`✍️ [VOTE_SERVICE] Enviando voto para sesión ${sessionCode}`)
    console.log(`👤 [VOTE_SERVICE] Usuario: ${voteData.username}`)
    
    return await apiRequest<{ message: string }>(
      buildUrl(config.endpoints.submitVote(sessionCode)),
      {
        method: 'POST',
        body: JSON.stringify(voteData)
      }
    )
  }
}
