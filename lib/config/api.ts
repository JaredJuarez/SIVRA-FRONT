// Configuración base para la API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  TIMEOUT: 30000,
};

// Endpoints de la API
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth',
    REGISTER: '/api/auth/register',
  },
  
  // Forms
  FORMS: {
    BASE: '/api/form',
    BY_ID: (id: string) => `/api/form/${id}`,
  },
  
  // Questions
  QUESTIONS: {
    CREATE: (formId: string) => `/api/question/form/${formId}`,
    BY_ID: (id: string) => `/api/question/${id}`,
  },
  
  // Options
  OPTIONS: {
    CREATE: (questionId: string) => `/api/option/question/${questionId}`,
    BY_ID: (id: string) => `/api/option/${id}`,
  },
  
  // Responses
  RESPONSES: {
    CREATE: (id: string) => `/api/response/${id}`,
    BY_FORM: (id: string) => `/api/response/form/${id}`,
  },
};

// Headers comunes
export const getAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
});

// Cliente HTTP base
export class ApiClient {
  private baseURL: string;
  private token?: string;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = undefined;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('🌐 API Request:', {
      url,
      method: options.method || 'GET',
      headers: {
        ...getAuthHeaders(this.token),
        ...options.headers,
      },
      body: options.body
    });
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(this.token),
        ...options.headers,
      },
    });

    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
