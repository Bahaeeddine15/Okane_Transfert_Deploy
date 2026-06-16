import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpClient,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';

import { TokenService } from '../auth/services/token';
import {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  LOGIN_ROUTES,
} from '../utils/constants';
import { AuthTokensResponse } from '../auth/models/auth';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const http = inject(HttpClient);

  const accessToken = tokenService.getToken();

  const isAuthRequest =
    request.url.includes('/api/auth/login') ||
    request.url.includes('/api/auth/register') ||
    request.url.includes('/api/auth/verify-email') ||
    request.url.includes('/api/auth/refresh') ||
    request.url.includes('/api/auth/logout');

  if (isAuthRequest) {
    return next(request);
  }

  const authRequest = accessToken
    ? addAuthorizationHeader(request, accessToken)
    : request;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(authRequest, next, tokenService, router, http);
      }

      return throwError(() => error);
    })
  );
};

function addAuthorizationHeader(
  request: HttpRequest<unknown>,
  token: string
): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenService: TokenService,
  router: Router,
  http: HttpClient
): Observable<HttpEvent<unknown>> {
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((newAccessToken) => {
        return next(addAuthorizationHeader(request, newAccessToken));
      })
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  const refreshToken = tokenService.getRefreshToken();

  if (!refreshToken) {
    isRefreshing = false;
    clearSessionAndRedirect(tokenService, router);
    return throwError(() => new Error('No refresh token available.'));
  }

  return http
    .post<AuthTokensResponse>(`${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`, {
      refreshToken,
    })
    .pipe(
      switchMap((response) => {
        tokenService.saveToken(response.accessToken);
        tokenService.saveRefreshToken(response.refreshToken);

        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);

        return next(addAuthorizationHeader(request, response.accessToken));
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);

        clearSessionAndRedirect(tokenService, router);

        return throwError(() => refreshError);
      })
    );
}

function clearSessionAndRedirect(
  tokenService: TokenService,
  router: Router
): void {
  const role = tokenService.getUser()?.role;

  tokenService.clear();

  const loginUrl = role ? LOGIN_ROUTES[role] : LOGIN_ROUTES.CLIENT;

  router.navigateByUrl(loginUrl);
}