import { getToken } from './auth';

// lib/api.ts - Client API pour communiquer avec l'API Express
const API_URL = process.env.REACT_APP_API_URL || 'https://apiepargne.tpareschi.eu';

export interface ApiResponse<T = any> {
  error?: string;
  [key: string]: any;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Ajouter le token JWT s'il existe
  const token = await getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log(`[API] ${options.method || 'GET'} ${url}`);
  if (token) {
    console.log(`[API] Token présent: ${token.substring(0, 20)}...`);
  } else {
    console.warn(`[API] Aucun token trouvé!`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log(`[API] Status: ${response.status}`);

  if (!response.ok) {
    let error;
    const contentType = response.headers.get('content-type');

    console.error(`[API] Erreur ${response.status}`);
    console.error(`[API] Content-Type: ${contentType}`);

    if (contentType?.includes('application/json')) {
      error = await response.json().catch((e) => {
        console.error(`[API] JSON parse error:`, e);
        return { error: 'Erreur API' };
      });
      console.error(`[API] Réponse JSON:`, error);
    } else {
      const text = await response.text();
      console.error(`[API] Réponse non-JSON:`, text);
      error = { error: `Erreur API (${response.status}): Réponse non-JSON` };
    }

    throw new Error(error.error || `API Error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`[API] Succès:`, data);
  return data;
}

// Auth
export async function register(email: string, password: string, firstName: string, lastName: string) {
  return apiCall('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
}

export async function login(email: string, password: string) {
  return apiCall('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Shared Accounts
export async function getSharedAccounts() {
  return apiCall('/api/v1/shared-accounts');
}

export async function createSharedAccount(name: string, description: string, targetAmount: number, currency: string) {
  return apiCall('/api/v1/shared-accounts', {
    method: 'POST',
    body: JSON.stringify({ name, description, targetAmount, currency }),
  });
}

export async function getSharedAccount(id: string) {
  return apiCall(`/api/v1/shared-accounts/${id}`);
}

export async function updateSharedAccount(id: string, data: any) {
  return apiCall(`/api/v1/shared-accounts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteSharedAccount(id: string) {
  return apiCall(`/api/v1/shared-accounts/${id}`, {
    method: 'DELETE',
  });
}

// Goals
export async function createGoal(accountId: string, name: string, targetAmount: number, deadline: string, description?: string) {
  return apiCall(`/api/v1/shared-accounts/${accountId}/goals`, {
    method: 'POST',
    body: JSON.stringify({ name, description, targetAmount, deadline }),
  });
}

export async function getGoals(accountId: string) {
  return apiCall(`/api/v1/shared-accounts/${accountId}/goals`);
}

export async function deleteGoal(accountId: string, goalId: string) {
  return apiCall(`/api/v1/shared-accounts/${accountId}/goals/${goalId}`, {
    method: 'DELETE',
  });
}

// Contributions
export async function createContribution(accountId: string, amount: number, description?: string) {
  return apiCall(`/api/v1/shared-accounts/${accountId}/contributions`, {
    method: 'POST',
    body: JSON.stringify({ amount, description }),
  });
}

export async function getContributions(accountId: string) {
  return apiCall(`/api/v1/shared-accounts/${accountId}/contributions`);
}

// Notifications
export async function getNotifications() {
  return apiCall('/api/v1/notifications');
}

export async function getUnreadNotifications() {
  return apiCall('/api/v1/notifications/unread');
}

export async function markNotificationAsRead(id: string) {
  return apiCall(`/api/v1/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function deleteNotification(id: string) {
  return apiCall(`/api/v1/notifications/${id}`, {
    method: 'DELETE',
  });
}

