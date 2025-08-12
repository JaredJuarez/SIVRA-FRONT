import { apiClient, API_ENDPOINTS } from '../config/api';
import { Form, CreateFormRequest, UpdateFormRequest, FormResponse } from '../types/form.types';

export class FormService {
  // Función para formatear fechas desde el backend de Java
  private formatDateFromJava(dateString: string | null | undefined): string | undefined {
    if (!dateString) return undefined;
    try {
      // Si viene en formato ISO o similar, crear Date y formatear
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('📋 Invalid date received:', dateString);
        return undefined;
      }
      return date.toISOString();
    } catch (error) {
      console.warn('📋 Error parsing date:', dateString, error);
      return undefined;
    }
  }

  async getForms(): Promise<Form[]> {
    console.log('📋 FormService: Getting forms...');
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.FORMS.BASE);
      console.log('📋 FormService: Raw response:', response);
      
      // El backend devuelve APIResponse con data
      if (response.data && Array.isArray(response.data)) {
        const forms = response.data.map((formData: any) => ({
          id: formData.id?.toString() || '',
          title: formData.title || '',
          description: formData.description || '',
          type: formData.type || '',
          open: this.formatDateFromJava(formData.open),
          closed: this.formatDateFromJava(formData.closed),
          created: this.formatDateFromJava(formData.created),
          expired: this.formatDateFromJava(formData.expired),
          questions: formData.questions || []
        }));
        console.log('📋 FormService: Mapped forms:', forms);
        return forms;
      }
      
      return [];
    } catch (error) {
      console.error('❌ FormService: Error getting forms:', error);
      throw new Error('Error al obtener formularios');
    }
  }

  async getForm(id: string): Promise<Form> {
    console.log('📋 FormService: Getting form by id:', id);
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.FORMS.BY_ID(id));
      console.log('📋 FormService: Form response:', response);
      
      if (response.data) {
        const formData = response.data;
        return {
          id: formData.id?.toString() || '',
          title: formData.title || '',
          description: formData.description || '',
          type: formData.type || '',
          open: this.formatDateFromJava(formData.open),
          closed: this.formatDateFromJava(formData.closed),
          created: this.formatDateFromJava(formData.created),
          expired: this.formatDateFromJava(formData.expired),
          questions: formData.questions || []
        };
      }
      
      throw new Error('Formulario no encontrado');
    } catch (error) {
      console.error('❌ FormService: Error getting form:', error);
      throw new Error('Error al obtener formulario');
    }
  }

  async createForm(formData: CreateFormRequest): Promise<Form> {
    console.log('📋 FormService: Creating form:', formData);
    console.log('📋 FormService: Endpoint URL:', API_ENDPOINTS.FORMS.BASE);
    console.log('📋 FormService: Request payload:', JSON.stringify(formData, null, 2));
    
    // Intentemos con el formato exacto que podría esperar el backend de Java
    const javaFormattedData = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      type: formData.type,
      // Asegurémonos de que los campos opcionales no estén undefined
      ...(formData.open && { open: formData.open }),
      ...(formData.closed && { closed: formData.closed })
    };
    
    console.log('📋 FormService: Java-formatted payload:', JSON.stringify(javaFormattedData, null, 2));
    
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.FORMS.BASE, javaFormattedData);
      console.log('📋 FormService: Create response:', response);
      console.log('📋 FormService: Response data:', JSON.stringify(response, null, 2));
      
      // El backend podría devolver la información en diferentes estructuras
      let formData = null;
      
      if (response.data) {
        formData = response.data;
      } else if (response.id) {
        // Si la respuesta directa contiene el formulario
        formData = response;
      } else {
        console.log('📋 Unexpected response structure:', response);
        throw new Error('Estructura de respuesta inesperada');
      }
      
      console.log('📋 FormService: Extracted form data:', formData);
      
      return {
        id: formData.id?.toString() || '',
        title: formData.title || '',
        description: formData.description || '',
        type: formData.type || '',
        open: this.formatDateFromJava(formData.open),
        closed: this.formatDateFromJava(formData.closed),
        created: this.formatDateFromJava(formData.created),
        expired: this.formatDateFromJava(formData.expired),
        questions: formData.questions || []
      };
    } catch (error) {
      console.error('❌ FormService: Error creating form:', error);
      
      // WORKAROUND: Si el backend devuelve 400 pero sabemos que a veces crea el formulario de todas formas,
      // vamos a intentar obtener la lista de formularios para verificar si se creó
      if (error instanceof Error && error.message.includes('HTTP error! status: 400')) {
        console.log('⚠️ FormService: Got 400 error, checking if form was actually created...');
        
        try {
          // Esperar un momento para que el backend procese
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Obtener la lista de formularios para ver si se creó
          const forms = await this.getForms();
          
          // Buscar el formulario recién creado por título (asumiendo que es único)
          const createdForm = forms.find(form => 
            form.title === javaFormattedData.title && 
            form.description === javaFormattedData.description
          );
          
          if (createdForm) {
            console.log('✅ FormService: Form was actually created despite 400 error!', createdForm);
            return createdForm;
          } else {
            console.log('❌ FormService: Form was not found after 400 error');
          }
        } catch (listError) {
          console.error('❌ FormService: Error checking if form was created:', listError);
        }
      }
      
      throw new Error('Error al crear formulario');
    }
  }

  async updateForm(id: string, formData: UpdateFormRequest): Promise<Form> {
    console.log('📋 FormService: Updating form:', id, formData);
    try {
      const response = await apiClient.put<any>(API_ENDPOINTS.FORMS.BY_ID(id), formData);
      console.log('📋 FormService: Update response:', response);
      
      if (response.data) {
        const updatedForm = response.data;
        return {
          id: updatedForm.id?.toString() || '',
          title: updatedForm.title || '',
          description: updatedForm.description || '',
          type: updatedForm.type || '',
          open: updatedForm.open || undefined,
          closed: updatedForm.closed || undefined,
          created: updatedForm.created || undefined,
          expired: updatedForm.expired || undefined,
          questions: updatedForm.questions || []
        };
      }
      
      throw new Error('Error en la respuesta del servidor');
    } catch (error) {
      console.error('❌ FormService: Error updating form:', error);
      throw new Error('Error al actualizar formulario');
    }
  }

  async deleteForm(id: string): Promise<void> {
    console.log('📋 FormService: Deleting form:', id);
    try {
      const response = await apiClient.delete<any>(API_ENDPOINTS.FORMS.BY_ID(id));
      console.log('📋 FormService: Delete response:', response);
      
      // Para delete, solo verificamos que no haya error
      if (response.error) {
        throw new Error(response.message || 'Error al eliminar formulario');
      }
    } catch (error) {
      console.error('❌ FormService: Error deleting form:', error);
      throw new Error('Error al eliminar formulario');
    }
  }
}

export const formService = new FormService();
