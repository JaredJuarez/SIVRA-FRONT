import { apiClient, API_ENDPOINTS } from '../config/api';
import { Question, CreateQuestionRequest, UpdateQuestionRequest } from '../types/question.types';

export class QuestionService {
  async createQuestion(formId: string, questionData: CreateQuestionRequest): Promise<Question> {
    console.log('📝 QuestionService: Creating question for form:', formId, questionData);
    try {
      const response = await apiClient.post<Question>(API_ENDPOINTS.QUESTIONS.CREATE(formId), questionData);
      console.log('✅ QuestionService: Question created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ QuestionService: Error creating question:', error);
      throw new Error('Error al crear la pregunta');
    }
  }

  async getQuestionsByForm(formId: string): Promise<Question[]> {
    console.log('📝 QuestionService: Getting questions for form:', formId);
    try {
      const response = await apiClient.get<Question[]>(API_ENDPOINTS.QUESTIONS.BY_FORM(formId));
      console.log('✅ QuestionService: Questions retrieved successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ QuestionService: Error getting questions:', error);
      throw new Error('Error al obtener las preguntas');
    }
  }

  async getQuestionById(id: string): Promise<Question> {
    console.log('📝 QuestionService: Getting question by id:', id);
    try {
      const response = await apiClient.get<Question>(API_ENDPOINTS.QUESTIONS.BY_ID(id));
      console.log('✅ QuestionService: Question retrieved successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ QuestionService: Error getting question:', error);
      throw new Error('Error al obtener la pregunta');
    }
  }

  async updateQuestion(id: string, questionData: UpdateQuestionRequest): Promise<Question> {
    console.log('📝 QuestionService: Updating question:', id, questionData);
    try {
      const response = await apiClient.put<Question>(API_ENDPOINTS.QUESTIONS.BY_ID(id), questionData);
      console.log('✅ QuestionService: Question updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ QuestionService: Error updating question:', error);
      throw new Error('Error al actualizar la pregunta');
    }
  }

  async deleteQuestion(id: string): Promise<void> {
    console.log('📝 QuestionService: Deleting question:', id);
    try {
      await apiClient.delete<void>(API_ENDPOINTS.QUESTIONS.BY_ID(id));
      console.log('✅ QuestionService: Question deleted successfully');
    } catch (error) {
      console.error('❌ QuestionService: Error deleting question:', error);
      throw new Error('Error al eliminar la pregunta');
    }
  }
}

export const questionService = new QuestionService();
