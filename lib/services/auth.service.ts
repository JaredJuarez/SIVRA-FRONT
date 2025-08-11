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
      
      // Guardar token en el cliente API si existe
      if (response.token) {
        apiClient.setToken(response.token);
        
        // Guardar token en localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      
      return response;
      
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
