import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

import {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  CLIENT_ENDPOINTS,
  LOGIN_ROUTES,
  ROUTES_BY_ROLE,
} from '../../utils/constants';

import {
  AuthTokensResponse,
  ClientRegisterRequest,
  ClientResponse,
  LoginRequest,
  LoginResponse,
} from '../models/auth';

import { AuthUser, UserRole } from '../models/user';
import { TokenService } from './token';

export interface RegisterClientResponse {
  message: string;
  client: ClientResponse;
}

export interface ApiMessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(TokenService);

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(
    this.tokenService.getUser()
  );

  currentUser$ = this.currentUserSubject.asObservable();

  get currentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  login(request: LoginRequest, expectedRole?: UserRole): Observable<AuthUser> {
    return this.http
      .post<LoginResponse>(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, request)
      .pipe(
        map((response) => this.normalizeLoginResponse(response)),
        tap(({ accessToken, refreshToken, user }) => {
          if (expectedRole && user.role !== expectedRole) {
            throw new Error(
              `Access denied. This page is only for ${expectedRole}.`
            );
          }

          /*
           * Save both tokens:
           * - accessToken is used for normal API requests
           * - refreshToken is used only to renew the session
           */
          this.tokenService.saveToken(accessToken);
          this.tokenService.saveRefreshToken(refreshToken);

          this.tokenService.saveUser(user);
          this.currentUserSubject.next(user);
        }),
        map(({ user }) => user)
      );
  }

  registerClient(
    request: ClientRegisterRequest
  ): Observable<RegisterClientResponse> {
    return this.http.post<RegisterClientResponse>(
      `${API_BASE_URL}${AUTH_ENDPOINTS.REGISTER}`,
      request
    );
  }

  verifyEmail(token: string): Observable<ApiMessageResponse> {
    return this.http.get<ApiMessageResponse>(
      `${API_BASE_URL}${AUTH_ENDPOINTS.VERIFY_EMAIL}?token=${encodeURIComponent(
        token
      )}`
    );
  }

  /*
   * Calls the backend /refresh endpoint.
   * If the refresh token is valid, the backend returns a new access token
   * and a new refresh token.
   */
  refreshTokens(): Observable<AuthTokensResponse> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }

    return this.http
      .post<AuthTokensResponse>(`${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`, {
        refreshToken,
      })
      .pipe(
        tap((response) => {
          this.tokenService.saveToken(response.accessToken);
          this.tokenService.saveRefreshToken(response.refreshToken);
        })
      );
  }

  loadClientMe(): Observable<ClientResponse> {
    return this.http
      .get<ClientResponse>(`${API_BASE_URL}${CLIENT_ENDPOINTS.ME}`)
      .pipe(
        tap((client) => {
          const currentUser = this.currentUserValue;

          if (!currentUser) {
            return;
          }

          const updatedUser: AuthUser = {
            ...currentUser,
            email: client.email,
            firstName: client.firstName,
            lastName: client.lastName,
            phoneNumber: client.phoneNumber,
            cin: client.cin,
            enabled: client.enabled,
          };

          this.tokenService.saveUser(updatedUser);
          this.currentUserSubject.next(updatedUser);
        })
      );
  }

  /*
   * Logout now also calls the backend to revoke the refresh token.
   * Even if the backend call fails, we still clear the frontend session.
   */
  logout(redirect = true): void {
    const role = this.currentUserValue?.role;
    const refreshToken = this.tokenService.getRefreshToken();

    const clearFrontendSession = () => {
      this.tokenService.clear();
      this.currentUserSubject.next(null);

      if (redirect) {
        const loginUrl = role
          ? this.getLoginUrlByRole(role)
          : LOGIN_ROUTES.CLIENT;

        this.router.navigateByUrl(loginUrl);
      }
    };

    if (!refreshToken) {
      clearFrontendSession();
      return;
    }

    this.http
      .post<ApiMessageResponse>(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGOUT}`, {
        refreshToken,
      })
      .subscribe({
        next: () => {
          clearFrontendSession();
        },
        error: () => {
          /*
           * If logout request fails, we still remove local tokens.
           * The frontend must not keep the user logged in.
           */
          clearFrontendSession();
        },
      });
  }

  isAuthenticated(): boolean {
    return this.tokenService.isLoggedIn();
  }

  hasRole(role: UserRole): boolean {
    return this.currentUserValue?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const currentRole = this.currentUserValue?.role;
    return !!currentRole && roles.includes(currentRole);
  }

  getDashboardUrlByRole(role: UserRole): string {
    return ROUTES_BY_ROLE[role];
  }

  getLoginUrlByRole(role: UserRole): string {
    return LOGIN_ROUTES[role];
  }

  private normalizeLoginResponse(response: LoginResponse): {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  } {
    if (!response.accessToken) {
      throw new Error('No access token returned by backend.');
    }

    if (!response.refreshToken) {
      throw new Error('No refresh token returned by backend.');
    }

    const role = this.normalizeRole(response.role);

    if (!role) {
      throw new Error('No valid role returned by backend.');
    }

    const user: AuthUser = {
      id: response.id,

      /*
       * We keep username for frontend compatibility,
       * but backend now returns email.
       */
      username: response.email,
      email: response.email,
      role,
    };

    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user,
    };
  }

  private normalizeRole(role: unknown): UserRole | null {
    if (!role || typeof role !== 'string') {
      return null;
    }

    const cleanedRole = role.replace('ROLE_', '').toUpperCase();

    if (cleanedRole === 'ADMIN') return 'ADMIN';
    if (cleanedRole === 'AGENT') return 'AGENT';
    if (cleanedRole === 'CLIENT') return 'CLIENT';

    return null;
  }
}