import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authLib from '@/lib/auth';
import { login as apiLogin, register as apiRegister, ApiResponse } from '@/lib/api';
import { logger } from '@/lib/logger';

/**
 * Extrait user et token d'une réponse API
 * Gère plusieurs formats de réponse
 */
function extractAuthData(response: ApiResponse): { user: authLib.User | null; token: string } {
  let user: authLib.User | undefined;
  let token: string | undefined;

  if (response.data && (response.data as Record<string, unknown>).user) {
    // Format: { data: { user: {...}, token: "..." } }
    user = (response.data as { user: authLib.User }).user;
    token = (response.data as { token?: string; accessToken?: string }).token || (response.data as { accessToken?: string }).accessToken;
  } else if ((response as { user?: authLib.User }).user) {
    // Format: { user: {...}, token: "..." }
    user = (response as { user: authLib.User }).user;
    token = (response as { token?: string; accessToken?: string }).token || (response as { accessToken?: string }).accessToken;
  }

  if (!token) {
    console.error('[AuthContext] Pas de token dans la réponse:', response);
    throw new Error('Aucun token retourné par l\'API');
  }

  return { user: user || null, token };
}

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
        const savedUser = await authLib.getUser();

        if (!savedToken) {
          // Pas de token trouvé — c'est normal
          setTokenState(null);
          setUser(null);
        } else {
          // Token trouvé — on le garde et on restaure aussi le user
          setTokenState(savedToken);
          if (savedUser) {
            setUser(savedUser);
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('[AuthContext] Erreur lors du chargement de la session:', err.message);
        logger.error(MODULE, 'Erreur lors du chargement de la session', err).catch(() => {});
        setTokenState(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response: ApiResponse = await apiLogin(email, password);

      const { user, token } = extractAuthData(response);

      await authLib.setToken(token);
      await authLib.setUser(user || { id: '', email, firstName: '', lastName: '' });
      setTokenState(token);
      setUser(user);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[AuthContext] Erreur de connexion:', err.message);
      logger.error(MODULE, 'Erreur de connexion', err, { email }).catch(() => {});
      throw err;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
    try {
      console.log('[AuthContext] Register attempt for:', email);
      const response: ApiResponse = await apiRegister(email, password, firstName, lastName);

      const { user, token } = extractAuthData(response);

      await authLib.setToken(token);
      await authLib.setUser(user || { id: '', email, firstName, lastName });
      setTokenState(token);
      setUser(user);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[AuthContext] Erreur d\'inscription:', err.message);
      logger.error(MODULE, 'Erreur d\'inscription', err, { email, firstName, lastName }).catch(() => {});
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authLib.removeToken();
      await authLib.removeUser();
      setTokenState(null);
      setUser(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(MODULE, 'Erreur de déconnexion', err).catch(() => {});
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
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}