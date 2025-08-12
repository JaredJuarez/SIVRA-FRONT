import { apiClient, API_ENDPOINTS, API_CONFIG } from '../config/api';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('🔐 Login request:', {
      endpoint: API_ENDPOINTS.AUTH.LOGIN,
      credentials: credentials,
      credentialsStringified: JSON.stringify(credentials)
    });
    
    // Vamos a probar enviando la petición manualmente para debug
    try {
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`;
      console.log('🌐 Full URL:', url);
      
      const requestBody = {
        email: credentials.email,
        password: credentials.password
      };
      
      console.log('📤 Request body:', requestBody);
      
      const fetchResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📡 Response status:', fetchResponse.status);
      console.log('📡 Response headers:', Object.fromEntries(fetchResponse.headers.entries()));
      
      const responseText = await fetchResponse.text();
      console.log('📡 Response text:', responseText);
      
      if (!fetchResponse.ok) {
        throw new Error(`HTTP ${fetchResponse.status}: ${responseText}`);
      }
      
      const response = JSON.parse(responseText);
      console.log('✅ Parsed response:', response);
      
      // Ajustar la estructura de respuesta del backend
      // El backend devuelve: { message, data: { token, role }, error, status }
      // Necesitamos adaptarlo a: { user, token }
      const adaptedResponse = {
        token: response.data?.token,
        user: {
          id: '1', // Por ahora hardcodeado, después ajustar según backend
          email: credentials.email,
          name: 'Admin User', // Por ahora hardcodeado
          role: response.data?.role?.toLowerCase() || 'admin'
        }
      };
      
      console.log('🔄 Adapted response:', adaptedResponse);
      
      // Guardar token en el cliente API si existe
      if (adaptedResponse.token) {
        apiClient.setToken(adaptedResponse.token);
        
        // Guardar token en localStorage Y en cookies
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', adaptedResponse.token);
          localStorage.setItem('user', JSON.stringify(adaptedResponse.user));
          
          // También guardar en cookies para el middleware
          document.cookie = `auth_token=${adaptedResponse.token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 días
        }
      }
      
      return adaptedResponse;
      
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    
    // Guardar token en el cliente API
    apiClient.setToken(response.token);
    
    // Guardar token en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  logout(): void {
    apiClient.clearToken();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // También eliminar la cookie
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      apiClient.setToken(token);
    }
  }
}

export const authService = new AuthService();
