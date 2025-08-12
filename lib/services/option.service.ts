import { apiClient, API_ENDPOINTS } from '../config/api';
import { Option, CreateOptionRequest, UpdateOptionRequest } from '../types/option.types';

export class OptionService {
  async createOption(questionId: string, optionData: CreateOptionRequest): Promise<Option> {
    console.log('⚡ OptionService: Creating option for question:', questionId, optionData);
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.OPTIONS.CREATE(questionId), optionData);
      console.log('⚡ OptionService: Option created:', response);
      
      if (response.data) {
        return {
          id: response.data.id?.toString() || '',
          questionId: response.data.questionId || questionId,
          text: response.data.text || response.data.value || '',
          order: response.data.order || 0
        };
      }
      
      throw new Error('Respuesta inválida del servidor');
    } catch (error) {
      console.error('❌ OptionService: Error creating option:', error);
      throw new Error('Error al crear la opción');
    }
  }

  async getOptionById(id: string): Promise<Option> {
    console.log('⚡ OptionService: Getting option by id:', id);
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.OPTIONS.BY_ID(id));
      console.log('⚡ OptionService: Option response:', response);
      
      if (response.data) {
        return {
          id: response.data.id?.toString() || '',
          questionId: response.data.questionId || '',
          text: response.data.text || response.data.value || '',
          order: response.data.order || 0
        };
      }
      
      throw new Error('Opción no encontrada');
    } catch (error) {
      console.error('❌ OptionService: Error getting option:', error);
      throw new Error('Error al obtener la opción');
    }
  }

  async updateOption(id: string, optionData: UpdateOptionRequest): Promise<Option> {
    console.log('⚡ OptionService: Updating option:', id, optionData);
    try {
      const response = await apiClient.put<any>(API_ENDPOINTS.OPTIONS.BY_ID(id), optionData);
      console.log('⚡ OptionService: Option updated:', response);
      
      if (response.data) {
        return {
          id: response.data.id?.toString() || '',
          questionId: response.data.questionId || '',
          text: response.data.text || response.data.value || '',
          order: response.data.order || 0
        };
      }
      
      throw new Error('Respuesta inválida del servidor');
    } catch (error) {
      console.error('❌ OptionService: Error updating option:', error);
      throw new Error('Error al actualizar la opción');
    }
  }

  async deleteOption(id: string): Promise<void> {
    console.log('⚡ OptionService: Deleting option:', id);
    try {
      await apiClient.delete<void>(API_ENDPOINTS.OPTIONS.BY_ID(id));
      console.log('⚡ OptionService: Option deleted successfully');
    } catch (error) {
      console.error('❌ OptionService: Error deleting option:', error);
      throw new Error('Error al eliminar la opción');
    }
  }
}

export const optionService = new OptionService();
