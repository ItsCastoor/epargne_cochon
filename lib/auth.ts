import AsyncStorage from '@react-native-async-storage/async-storage';

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

export async function setToken(token: string) {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error('[Auth] Erreur lors de la sauvegarde du token:', error);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('[Auth] Erreur lors de la récupération du token:', error);
    return null;
  }
}

export async function removeToken() {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.error('[Auth] Erreur lors de la suppression du token:', error);
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

export async function setUser(user: User) {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('[Auth] Erreur lors de la sauvegarde du user:', error);
  }
}

export async function getUser(): Promise<User | null> {
  try {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('[Auth] Erreur lors de la récupération du user:', error);
    return null;
  }
}

export async function removeUser() {
  try {
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('[Auth] Erreur lors de la suppression du user:', error);
  }
}
