'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/types/auth.types';
import { authService } from '@/lib/services/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicializar autenticación al cargar la aplicación
    const token = authService.getToken();
    if (token) {
      authService.initializeAuth();
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔄 AuthProvider: Starting login...');
      const response = await authService.login({ email, password });
      console.log('✅ AuthProvider: Login response:', response);
      console.log('👤 AuthProvider: User from response:', response.user);
      setUser(response.user);
      console.log('🎯 AuthProvider: User state set to:', response.user);
    } catch (error) {
      console.error('❌ AuthProvider: Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('⏹️ AuthProvider: Login process finished');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await authService.register({ email, password, name });
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;
  
  // Debug: monitorear cambios en el estado de autenticación
  useEffect(() => {
    console.log('🔐 AuthProvider: Authentication state changed:', {
      user,
      isAuthenticated,
      userExists: !!user
    });
  }, [user, isAuthenticated]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
