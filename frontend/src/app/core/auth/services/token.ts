import { Injectable } from '@angular/core';
import { AuthUser } from '../models/user';
import { STORAGE_KEYS } from '../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /*
   * Stores the short-lived JWT access token.
   * This token is sent in the Authorization header.
   */
  saveToken(token: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }

  /*
   * Returns the current access token.
   */
  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /*
   * Removes only the access token.
   */
  removeToken(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }

  /*
   * Stores the long-lived refresh token.
   * This token is used only to request new access tokens.
   */
  saveRefreshToken(refreshToken: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  /*
   * Returns the current refresh token.
   */
  getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /*
   * Removes only the refresh token.
   */
  removeRefreshToken(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  saveUser(user: AuthUser): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  getUser(): AuthUser | null {
    if (!this.isBrowser()) return null;

    const rawUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      this.removeUser();
      return null;
    }
  }

  removeUser(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /*
   * Clears the complete local authentication state.
   * This is used during logout or when refresh token fails.
   */
  clear(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
  }

  /*
   * The user is considered logged in if an access token exists.
   * Later, the interceptor can refresh it if it expires.
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  decodeTokenPayload(token: string): any | null {
    try {
      const payload = token.split('.')[1];

      if (!payload) {
        return null;
      }

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(normalizedPayload);

      return JSON.parse(decodedPayload);
    } catch {
      return null;
    }
  }
}