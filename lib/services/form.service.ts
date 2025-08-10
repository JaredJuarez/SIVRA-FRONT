import { apiClient, API_ENDPOINTS } from '../config/api';
import { Form, CreateFormRequest, UpdateFormRequest } from '../types/form.types';

export class FormService {
  async createForm(formData: CreateFormRequest): Promise<Form> {
    return apiClient.post<Form>(API_ENDPOINTS.FORMS.BASE, formData);
  }

  async getForms(): Promise<Form[]> {
    return apiClient.get<Form[]>(API_ENDPOINTS.FORMS.BASE);
  }

  async getFormById(id: string): Promise<Form> {
    return apiClient.get<Form>(API_ENDPOINTS.FORMS.BY_ID(id));
  }

  async updateForm(id: string, formData: UpdateFormRequest): Promise<Form> {
    return apiClient.put<Form>(API_ENDPOINTS.FORMS.BY_ID(id), formData);
  }

  async deleteForm(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.FORMS.BY_ID(id));
  }
}

export const formService = new FormService();
