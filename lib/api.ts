import { getToken } from './auth';
import { logger } from './logger';

// lib/api.ts - Client API pour communiquer avec l'API Express
const API_URL = process.env.REACT_APP_API_URL || 'https://apiepargne.tpareschi.eu';
const MODULE = 'API';

interface ApiHeaders {
  'Content-Type': string;
  [key: string]: string;
}

export interface ApiResponse<T = unknown> {
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

  await logger.debug(MODULE, `${options.method || 'GET'} ${url}`);
  if (!token) {
    await logger.warn(MODULE, 'Aucun token trouvé!');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    await logger.debug(MODULE, `Status: ${response.status}`, { endpoint });

    if (!response.ok) {
      let error: ApiResponse;
      const contentType = response.headers.get('content-type');

      await logger.error(MODULE, `Erreur ${response.status}`, undefined, { endpoint, contentType });

      if (contentType?.includes('application/json')) {
        error = await response.json().catch((): ApiResponse => {
          return { error: 'Erreur API' };
        });
        await logger.error(MODULE, 'Erreur API JSON', undefined, { errorResponse: error });
      } else {
        const text = await response.text();
        await logger.error(MODULE, 'Erreur API non-JSON', undefined, { response: text });
        error = { error: `Erreur API (${response.status}): Réponse non-JSON` };
      }

      throw new Error(String(error.error) || `API Error: ${response.status}`);
    }

    const data = await response.json() as T;
    await logger.debug(MODULE, `Succès ${endpoint}`);
    return data;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    await logger.error(MODULE, `Erreur lors de l'appel API ${endpoint}`, err, { endpoint });
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

