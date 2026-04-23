import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authLib from '@/lib/auth';
import { login as apiLogin, register as apiRegister } from '@/lib/api';
import { logger } from '@/lib/logger';

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
const MODULE = 'AuthContext';

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
        if (savedToken) {
          await logger.info(MODULE, 'Token trouvé au chargement');
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        await logger.error(MODULE, 'Erreur lors du chargement du token', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiLogin(email, password);

      // Gérer différents formats de réponse API
      let user: authLib.User | undefined;
      let token: string | undefined;

      await logger.info(MODULE, 'Réponse login reçue', { email });

      if (response.data && (response.data as Record<string, unknown>).user) {
        // Format: { data: { user: {...}, token: "..." } }
        user = (response.data as { user: authLib.User }).user;
        token = (response.data as { token?: string; accessToken?: string }).token || (response.data as { accessToken?: string }).accessToken;
      } else if ((response as { user?: authLib.User }).user) {
        // Format: { user: {...}, token: "..." }
        user = (response as { user: authLib.User }).user;
        token = (response as { token?: string; accessToken?: string }).token || (response as { accessToken?: string }).accessToken;
      } else {
        await logger.warn(MODULE, 'Format réponse non reconnu', { response });
        throw new Error('Format de réponse API non reconnu');
      }

      if (!token) {
        await logger.error(MODULE, 'Pas de token dans la réponse', undefined, { response });
        throw new Error('Aucun token retourné par l\'API');
      }

      await authLib.setToken(token);
      setTokenState(token);
      setUser(user || null);
      await logger.info(MODULE, 'Connexion réussie');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      await logger.error(MODULE, 'Erreur de connexion', err, { email });
      throw err;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
    try {
      const response = await apiRegister(email, password, firstName, lastName);

      // Gérer différents formats de réponse API
      let user: authLib.User | undefined;
      let token: string | undefined;

      await logger.info(MODULE, 'Réponse register reçue', { email, firstName, lastName });

      if (response.data && (response.data as Record<string, unknown>).user) {
        // Format: { data: { user: {...}, token: "..." } }
        user = (response.data as { user: authLib.User }).user;
        token = (response.data as { token?: string; accessToken?: string }).token || (response.data as { accessToken?: string }).accessToken;
      } else if ((response as { user?: authLib.User }).user) {
        // Format: { user: {...}, token: "..." }
        user = (response as { user: authLib.User }).user;
        token = (response as { token?: string; accessToken?: string }).token || (response as { accessToken?: string }).accessToken;
      } else {
        await logger.warn(MODULE, 'Format réponse non reconnu', { response });
        throw new Error('Format de réponse API non reconnu');
      }

      if (!token) {
        await logger.error(MODULE, 'Pas de token dans la réponse', undefined, { response });
        throw new Error('Aucun token retourné par l\'API');
      }

      await authLib.setToken(token);
      setTokenState(token);
      setUser(user || null);
      await logger.info(MODULE, 'Inscription réussie');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      await logger.error(MODULE, 'Erreur d\'inscription', err, { email, firstName, lastName });
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authLib.removeToken();
      setTokenState(null);
      setUser(null);
      await logger.info(MODULE, 'Déconnexion réussie');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      await logger.error(MODULE, 'Erreur de déconnexion', err);
      throw err;
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

