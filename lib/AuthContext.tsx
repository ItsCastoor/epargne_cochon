import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authLib from '@/lib/auth';
import { login as apiLogin, register as apiRegister } from '@/lib/api';

interface AuthContextType {
  user: authLib.User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<authLib.User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser au montage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = await authLib.getToken();
        setTokenState(savedToken);
      } catch (error) {
        console.error('[Auth] Erreur lors du chargement du token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);

      // Gérer différents formats de réponse API
      let user, token;

      console.log('[Auth] Réponse login reçue:', response);

      if (response.data && response.data.user) {
        // Format: { data: { user: {...}, token: "..." } }
        user = response.data.user;
        token = response.data.token || response.data.accessToken;
      } else if (response.user) {
        // Format: { user: {...}, token: "..." }
        user = response.user;
        token = response.token || response.accessToken;
      } else {
        console.error('[Auth] Format réponse non reconnu:', response);
        throw new Error('Format de réponse API non reconnu');
      }

      if (!token) {
        console.error('[Auth] Pas de token dans la réponse:', response);
        throw new Error('Aucun token retourné par l\'API');
      }

      await authLib.setToken(token);
      setTokenState(token);
      setUser(user);
      console.log('[Auth] Connexion réussie, token:', token.substring(0, 20) + '...');
    } catch (error: any) {
      console.error('[Auth] Erreur de connexion:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await apiRegister(email, password, firstName, lastName);

      // Gérer différents formats de réponse API
      let user, token;

      console.log('[Auth] Réponse register reçue:', response);

      if (response.data && response.data.user) {
        // Format: { data: { user: {...}, token: "..." } }
        user = response.data.user;
        token = response.data.token || response.data.accessToken;
      } else if (response.user) {
        // Format: { user: {...}, token: "..." }
        user = response.user;
        token = response.token || response.accessToken;
      } else {
        console.error('[Auth] Format réponse non reconnu:', response);
        throw new Error('Format de réponse API non reconnu');
      }

      if (!token) {
        console.error('[Auth] Pas de token dans la réponse:', response);
        throw new Error('Aucun token retourné par l\'API');
      }

      await authLib.setToken(token);
      setTokenState(token);
      setUser(user);
      console.log('[Auth] Inscription réussie');
    } catch (error: any) {
      console.error('[Auth] Erreur d\'inscription:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authLib.removeToken();
      setTokenState(null);
      setUser(null);
      console.log('[Auth] Déconnexion réussie');
    } catch (error) {
      console.error('[Auth] Erreur de déconnexion:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
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

