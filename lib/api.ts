import { getToken } from "./auth";
import { logger } from "./logger";

// lib/api.ts - Client API pour communiquer avec l'API Express
// Sur Expo, les variables d'env doivent commencer par EXPO_PUBLIC_
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "https://apiepargne.tpareschi.eu";
const MODULE = "API";

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
  "Content-Type": string;
  [key: string]: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  [key: string]: unknown;
}

export type NotificationType =
  | "CONTRIBUTION"
  | "OBJ_ATTEINT"
  | "MEMBRE_AJOUTE"
  | "MEMBRE_RETIRE"
  | "OBJ_RAPPEL"
  | "COMPTE_CREER"
  | "COMPTE_SUPP"
  | "RETRAIT";

export interface NotificationItem {
  id: string;
  type?: NotificationType | string;
  title?: string;
  message?: string;
  isRead?: boolean;
  createdAt: string;
  [key: string]: unknown;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers: ApiHeaders = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  // Ajouter le token JWT s'il existe
  const token = await getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!token) {
    logger.warn(MODULE, "Aucun token trouvé!").catch(() => {});
  }

  try {
    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    // Sur web, ajouter mode CORS
    if (typeof window !== "undefined") {
      fetchOptions.mode = "cors";
      if (!fetchOptions.credentials) {
        fetchOptions.credentials = "omit";
      }
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      let error: ApiResponse;
      const contentType = response.headers.get("content-type");
      let responseBody = "";

      try {
        if (contentType?.includes("application/json")) {
          error = await response.json();
        } else {
          responseBody = await response.text();
          error = { error: responseBody || `HTTP ${response.status}` };
        }
      } catch (parseError) {
        error = { error: `Erreur HTTP ${response.status}` };
      }

      const errorMessage =
        error.error || error.message || `HTTP ${response.status}`;
      console.error(`[API] ❌ Erreur ${response.status}: ${errorMessage}`);

      return Promise.reject(
        new Error(
          `${response.status} ${response.statusText}: ${String(errorMessage)}`,
        ),
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[API] 🔴 Exception: ${err.message}`, err);

    // Log d'exception non-bloquant
    throw err;
  }
}

// Auth
export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<ApiResponse> {
  return apiCall<ApiResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
}

export async function login(
  email: string,
  password: string,
): Promise<ApiResponse> {
  try {
    const result = await apiCall<ApiResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    console.log(`[API-Login] ✅ Connexion réussie!`);
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[API-Login] ❌ Connexion échouée: ${err.message}`);
    throw error;
  }
}

// Shared Accounts
export async function getSharedAccounts(): Promise<ApiResponse> {
  return apiCall<ApiResponse>("/api/v1/shared-accounts");
}

export async function createSharedAccount(
  name: string,
  description: string,
  targetAmount: number,
  currency: string,
): Promise<ApiResponse> {
  return apiCall<ApiResponse>("/api/v1/shared-accounts", {
    method: "POST",
    body: JSON.stringify({ name, description, targetAmount, currency }),
  });
}

export async function getSharedAccount(id: string): Promise<ApiResponse> {
  return apiCall<ApiResponse>(`/api/v1/shared-accounts/${id}`);
}

export async function deleteSharedAccount(id: string): Promise<ApiResponse> {
  return apiCall<ApiResponse>(`/api/v1/shared-accounts/${id}`, {
    method: "DELETE",
  });
}

// Goals

export async function getGoals(accountId: string): Promise<ApiResponse> {
  return apiCall<ApiResponse>(`/api/v1/shared-accounts/${accountId}/goals`);
}

export async function deleteGoal(
  accountId: string,
  goalId: string,
): Promise<ApiResponse> {
  return apiCall<ApiResponse>(
    `/api/v1/shared-accounts/${accountId}/goals/${goalId}`,
    {
      method: "DELETE",
    },
  );
}

// Contributions
export async function createContribution(
  accountId: string,
  amount: number,
  description?: string,
): Promise<ApiResponse> {
  return apiCall<ApiResponse>(
    `/api/v1/shared-accounts/${accountId}/contributions`,
    {
      method: "POST",
      body: JSON.stringify({ amount, description }),
    },
  );
}

export async function getContributions(
  accountId: string,
): Promise<ApiResponse> {
  return apiCall<ApiResponse>(
    `/api/v1/shared-accounts/${accountId}/contributions`,
  );
}

// Withdrawals
export async function createWithdrawal(
  accountId: string,
  amount: number,
  description?: string,
): Promise<ApiResponse> {
  return apiCall<ApiResponse>(
    `/api/v1/shared-accounts/${accountId}/withdrawals`,
    {
      method: "POST",
      body: JSON.stringify({ amount, description }),
    },
  );
}

// Notifications
export async function getNotifications(): Promise<ApiResponse> {
  return apiCall<ApiResponse>("/api/v1/notifications");
}

export async function markNotificationAsRead(id: string): Promise<ApiResponse> {
  return apiCall<ApiResponse>(`/api/v1/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead(): Promise<ApiResponse> {
  return apiCall<ApiResponse>("/api/v1/notifications/mark-all-as-read", {
    method: "PATCH",
  });
}

export async function markNotificationAsUnread(
  id: string,
): Promise<ApiResponse> {
  return apiCall<ApiResponse>(`/api/v1/notifications/${id}/unread`, {
    method: "PATCH",
  });
}

export async function createNotification(
  accountId: string,
  type: NotificationType,
  title: string,
  message: string,
): Promise<ApiResponse> {
  return apiCall<ApiResponse>("/api/v1/notifications", {
    method: "POST",
    body: JSON.stringify({ accountId, type, title, message }),
  });
}

export async function deleteNotification(id: string): Promise<ApiResponse> {
  return apiCall<ApiResponse>(`/api/v1/notifications/${id}`, {
    method: "DELETE",
  });
}

// Members
export async function getAccountMembers(
  accountId: string,
): Promise<ApiResponse> {
  return apiCall<ApiResponse>(`/api/v1/shared-accounts/${accountId}/members`);
}

export async function inviteMember(
  accountId: string,
  email: string,
  role?: string,
): Promise<ApiResponse> {
  return apiCall<ApiResponse>(
    `/api/v1/shared-accounts/${accountId}/members/invite`,
    {
      method: "POST",
      body: JSON.stringify({ email, role }),
    },
  );
}

export async function removeMember(
  accountId: string,
  memberId: string,
): Promise<ApiResponse> {
  return apiCall<ApiResponse>(
    `/api/v1/shared-accounts/${accountId}/members/${memberId}`,
    {
      method: "DELETE",
    },
  );
}
