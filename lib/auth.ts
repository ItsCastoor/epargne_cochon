// lib/auth.ts - Gestion de l'authentification
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    // Aussi sauvegarder dans les cookies pour le middleware côté serveur
    // Format: token=value; path=/; max-age=86400; SameSite=Lax
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    // Supprimer aussi du cookie (mettre max-age à 0)
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

