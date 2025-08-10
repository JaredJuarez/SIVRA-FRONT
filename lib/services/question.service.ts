import { apiClient, API_ENDPOINTS } from '../config/api';
import { Question, CreateQuestionRequest, UpdateQuestionRequest } from '../types/question.types';

export class QuestionService {
  async createQuestion(formId: string, questionData: CreateQuestionRequest): Promise<Question> {
    return apiClient.post<Question>(API_ENDPOINTS.QUESTIONS.CREATE(formId), questionData);
  }

  async getQuestionById(id: string): Promise<Question> {
    return apiClient.get<Question>(API_ENDPOINTS.QUESTIONS.BY_ID(id));
  }

  async updateQuestion(id: string, questionData: UpdateQuestionRequest): Promise<Question> {
    return apiClient.put<Question>(API_ENDPOINTS.QUESTIONS.BY_ID(id), questionData);
  }

  async deleteQuestion(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.QUESTIONS.BY_ID(id));
  }
}

export const questionService = new QuestionService();
