import { apiClient, API_ENDPOINTS } from '../config/api';
import { Response, CreateResponseRequest } from '../types/response.types';

export class ResponseService {
  async createResponse(formId: string, responseData: CreateResponseRequest): Promise<Response> {
    return apiClient.post<Response>(API_ENDPOINTS.RESPONSES.CREATE(formId), responseData);
  }

  async getResponsesByForm(formId: string): Promise<Response[]> {
    return apiClient.get<Response[]>(API_ENDPOINTS.RESPONSES.BY_FORM(formId));
  }
}

export const responseService = new ResponseService();
