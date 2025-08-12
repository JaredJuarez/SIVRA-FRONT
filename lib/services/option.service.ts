import { apiClient, API_ENDPOINTS } from '../config/api';
import { Option, CreateOptionRequest, UpdateOptionRequest } from '../types/option.types';

export class OptionService {
  async createOption(questionId: string, optionData: CreateOptionRequest): Promise<Option> {
    console.log('🎯 OptionService: Creating option for question:', questionId, optionData);
    try {
      const response = await apiClient.post<Option>(API_ENDPOINTS.OPTIONS.CREATE(questionId), optionData);
      console.log('✅ OptionService: Option created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ OptionService: Error creating option:', error);
      throw new Error('Error al crear la opción');
    }
  }

  async getOptionsByQuestion(questionId: string): Promise<Option[]> {
    console.log('🎯 OptionService: Getting options for question:', questionId);
    try {
      const response = await apiClient.get<Option[]>(API_ENDPOINTS.OPTIONS.BY_QUESTION(questionId));
      console.log('✅ OptionService: Options retrieved successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ OptionService: Error getting options:', error);
      throw new Error('Error al obtener las opciones');
    }
  }

  async getOptionById(id: string): Promise<Option> {
    console.log('🎯 OptionService: Getting option by id:', id);
    try {
      const response = await apiClient.get<Option>(API_ENDPOINTS.OPTIONS.BY_ID(id));
      console.log('✅ OptionService: Option retrieved successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ OptionService: Error getting option:', error);
      throw new Error('Error al obtener la opción');
    }
  }

  async updateOption(id: string, optionData: UpdateOptionRequest): Promise<Option> {
    console.log('🎯 OptionService: Updating option:', id, optionData);
    try {
      const response = await apiClient.put<Option>(API_ENDPOINTS.OPTIONS.BY_ID(id), optionData);
      console.log('✅ OptionService: Option updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ OptionService: Error updating option:', error);
      throw new Error('Error al actualizar la opción');
    }
  }

  async deleteOption(id: string): Promise<void> {
    console.log('🎯 OptionService: Deleting option:', id);
    try {
      await apiClient.delete<void>(API_ENDPOINTS.OPTIONS.BY_ID(id));
      console.log('✅ OptionService: Option deleted successfully');
    } catch (error) {
      console.error('❌ OptionService: Error deleting option:', error);
      throw new Error('Error al eliminar la opción');
    }
  }
}

export const optionService = new OptionService();
