import { apiClient, API_ENDPOINTS } from '../config/api';
import { Option, CreateOptionRequest, UpdateOptionRequest } from '../types/option.types';

export class OptionService {
  async createOption(questionId: string, optionData: CreateOptionRequest): Promise<Option> {
    return apiClient.post<Option>(API_ENDPOINTS.OPTIONS.CREATE(questionId), optionData);
  }

  async getOptionById(id: string): Promise<Option> {
    return apiClient.get<Option>(API_ENDPOINTS.OPTIONS.BY_ID(id));
  }

  async updateOption(id: string, optionData: UpdateOptionRequest): Promise<Option> {
    return apiClient.put<Option>(API_ENDPOINTS.OPTIONS.BY_ID(id), optionData);
  }

  async deleteOption(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.OPTIONS.BY_ID(id));
  }
}

export const optionService = new OptionService();
