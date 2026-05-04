import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authLib from '@/lib/auth';
import { login as apiLogin, register as apiRegister, ApiResponse } from '@/lib/api';
import { logger } from '@/lib/logger';

const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'https://apiepargne.tpareschi.eu';

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

        if (!savedToken) {
          // Pas de token trouvé - c'est normal
          setTokenState(null);
          logger.info(MODULE, 'Aucun token trouvé au chargement').catch(() => {});
        } else {
          // Token trouvé, le valider en faisant une requête simple à l'API
          try {
            const response = await fetch(`${API_URL}/api/v1/auth/validate`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${savedToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              // Token valide
              setTokenState(savedToken);
              logger.info(MODULE, 'Token valide trouvé au chargement').catch(() => {});
            } else {
              // Token invalide - le supprimer
              await authLib.removeToken();
              setTokenState(null);
              logger.warn(MODULE, 'Token invalide trouvé, suppression').catch(() => {});
            }
          } catch (validationError) {
            // Erreur de validation - garder le token mais logger l'erreur
            setTokenState(savedToken);
            logger.warn(MODULE, 'Impossible de valider le token au démarrage').catch(() => {});
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(MODULE, 'Erreur lors du chargement du token', err).catch(() => {});
        setTokenState(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('[AuthContext] Login attempt for:', email);
      const response: ApiResponse = await apiLogin(email, password);

      logger.info(MODULE, 'Réponse login reçue', { email }).catch(() => {});

      const { user, token } = extractAuthData(response);

      await authLib.setToken(token);
      setTokenState(token);
      setUser(user);
      logger.info(MODULE, 'Connexion réussie').catch(() => {});
      console.log('[AuthContext] Login successful');
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

      logger.info(MODULE, 'Réponse register reçue', { email, firstName, lastName }).catch(() => {});

      const { user, token } = extractAuthData(response);

      await authLib.setToken(token);
      setTokenState(token);
      setUser(user);
      logger.info(MODULE, 'Inscription réussie').catch(() => {});
      console.log('[AuthContext] Register successful, isAuthenticated:', !!token);
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
      setTokenState(null);
      setUser(null);
      logger.info(MODULE, 'Déconnexion réussie').catch(() => {});
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