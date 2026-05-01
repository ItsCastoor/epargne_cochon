import { getToken } from './auth';
import { logger } from './logger';

// lib/api.ts - Client API pour communiquer avec l'API Express
// Sur Expo, les variables d'env doivent commencer par EXPO_PUBLIC_
const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'https://apiepargne.tpareschi.eu';
const MODULE = 'API';

// ⚠️ IMPORTANT: L'API doit retourner les en-têtes CORS corrects
// Si vous voyez "Failed to fetch", c'est que le backend n'envoie pas:
//   Access-Control-Allow-Origin: http://localhost:8081
//   Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
//   Access-Control-Allow-Headers: Content-Type, Authorization
//
// Solution pour le développement: Utiliser un proxy CORS
// https://cors-anywhere.herokuapp.com/ ou équivalent
//
// Solution définitive: Configurer le backend avec les bons headers CORS

interface ApiHeaders {
  'Content-Type': string;
  [key: string]: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  [key: string]: unknown;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers: ApiHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  // Ajouter le token JWT s'il existe
  const token = await getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Logs non-bloquants (fire and forget)
  logger.debug(MODULE, `${options.method || 'GET'} ${url}`).catch(() => {});
  if (!token) {
    logger.warn(MODULE, 'Aucun token trouvé!').catch(() => {});
  }

  try {
    console.log(`[API] 🚀 Requête ${options.method || 'GET'} vers: ${url}`);
    console.log(`[API] Headers:`, headers);
    console.log(`[API] Body:`, options.body);
    
    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };
    
    // Sur web, ajouter mode CORS
    if (typeof window !== 'undefined') {
      fetchOptions.mode = 'cors';
      if (!fetchOptions.credentials) {
        fetchOptions.credentials = 'omit';
      }
    }
    
    console.log(`[API] Fetch options:`, fetchOptions);
    
    const response = await fetch(url, fetchOptions);

    console.log(`[API] ⬅️ Réponse reçue: ${response.status}`);
    
    // Log non-bloquant
    logger.debug(MODULE, `⬅️ Réponse reçue`, {
      status: response.status,
      endpoint,
      contentType: response.headers.get('content-type')
    }).catch(() => {});

    if (!response.ok) {
      let error: ApiResponse;
      const contentType = response.headers.get('content-type');
      let responseBody = '';

      try {
        if (contentType?.includes('application/json')) {
          error = await response.json();
          responseBody = JSON.stringify(error);
        } else {
          responseBody = await response.text();
          error = { error: responseBody || `HTTP ${response.status}` };
        }
      } catch (parseError) {
        responseBody = '(impossible de parser la réponse)';
        error = { error: `Erreur HTTP ${response.status}` };
      }

      const errorMessage = error.error || error.message || `HTTP ${response.status}`;
      console.error(`[API] ❌ Erreur ${response.status}: ${errorMessage}`);

      // Log d'erreur non-bloquant
      logger.error(MODULE, `❌ Erreur ${response.status} - ${errorMessage}`, undefined, {
        endpoint,
        status: response.status,
        contentType,
        responseBody,
        methodUsed: options.method || 'GET'
      }).catch(() => {});

      throw new Error(String(errorMessage));
    }

    const data = await response.json() as T;
    console.log(`[API] ✅ Succès pour ${endpoint}`, data);
    
    // Log de succès non-bloquant
    logger.debug(MODULE, `✅ Succès ${endpoint}`, {
      endpoint,
      status: response.status,
      dataKeys: Object.keys(data as Record<string, unknown>).slice(0, 5)
    }).catch(() => {});
    return data;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[API] 🔴 Exception: ${err.message}`, err);
    
    // Log d'exception non-bloquant
    logger.error(MODULE, `🔴 Exception API: ${err.message}`, err, {
      endpoint,
      method: options.method || 'GET'
    }).catch(() => {});
    throw err;
  }
}

// Auth
export async function register(email: string, password: string, firstName: string, lastName: string): Promise<ApiResponse> {
  return apiCall('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
}

export async function login(email: string, password: string): Promise<ApiResponse> {
  return apiCall('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Shared Accounts
export async function getSharedAccounts(): Promise<ApiResponse> {
  return apiCall('/api/v1/shared-accounts');
}

export async function createSharedAccount(name: string, description: string, targetAmount: number, currency: string): Promise<ApiResponse> {
  return apiCall('/api/v1/shared-accounts', {
    method: 'POST',
    body: JSON.stringify({ name, description, targetAmount, currency }),
  });
}

export async function getSharedAccount(id: string): Promise<ApiResponse> {
  return apiCall(`/api/v1/shared-accounts/${id}`);
}

export async function updateSharedAccount(id: string, data: Record<string, unknown>): Promise<ApiResponse> {
  return apiCall(`/api/v1/shared-accounts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteSharedAccount(id: string): Promise<ApiResponse> {
  return apiCall(`/api/v1/shared-accounts/${id}`, {
    method: 'DELETE',
  });
}

// Goals
export async function createGoal(accountId: string, name: string, targetAmount: number, deadline: string, description?: string): Promise<ApiResponse> {
  return apiCall(`/api/v1/shared-accounts/${accountId}/goals`, {
    method: 'POST',
    body: JSON.stringify({ name, description, targetAmount, deadline }),
  });
}

export async function getGoals(accountId: string): Promise<ApiResponse> {
  return apiCall(`/api/v1/shared-accounts/${accountId}/goals`);
}

export async function deleteGoal(accountId: string, goalId: string): Promise<ApiResponse> {
  return apiCall(`/api/v1/shared-accounts/${accountId}/goals/${goalId}`, {
    method: 'DELETE',
  });
}

// Contributions
export async function createContribution(accountId: string, amount: number, description?: string): Promise<ApiResponse> {
  return apiCall(`/api/v1/shared-accounts/${accountId}/contributions`, {
    method: 'POST',
    body: JSON.stringify({ amount, description }),
  });
}

export async function getContributions(accountId: string): Promise<ApiResponse> {
  return apiCall(`/api/v1/shared-accounts/${accountId}/contributions`);
}

// Notifications
export async function getNotifications(): Promise<ApiResponse> {
  return apiCall('/api/v1/notifications');
}

export async function getUnreadNotifications(): Promise<ApiResponse> {
  return apiCall('/api/v1/notifications/unread');
}

export async function markNotificationAsRead(id: string): Promise<ApiResponse> {
  return apiCall(`/api/v1/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function deleteNotification(id: string): Promise<ApiResponse> {
  return apiCall(`/api/v1/notifications/${id}`, {
    method: 'DELETE',
  });
}
