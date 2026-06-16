import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { TokenService } from '../auth/services/token';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const currentUrl = router.url;
      const accessToken = tokenService.getToken();
      const refreshToken = tokenService.getRefreshToken();
      const user = tokenService.getUser();

      /*
       * Authentication endpoints are handled by the component or by jwtInterceptor.
       * We should not redirect automatically here.
       */
      const isAuthRequest =
        request.url.includes('/api/auth/login') ||
        request.url.includes('/api/auth/register') ||
        request.url.includes('/api/auth/verify-email') ||
        request.url.includes('/api/auth/refresh') ||
        request.url.includes('/api/auth/logout');

      if (isAuthRequest) {
        return throwError(() => error);
      }

      /*
       * 403 means the user is authenticated but does not have permission.
       * Example: AGENT trying to access ADMIN route.
       */
      if (error.status === 403) {
        router.navigateByUrl('/unauthorized');
        return throwError(() => error);
      }

      /*
       * Very important:
       * If we receive 401 but we still have a refresh token,
       * do NOT clear the session here.
       *
       * The jwtInterceptor will catch this 401 and call /api/auth/refresh.
       */
      if (error.status === 401 && refreshToken) {
        return throwError(() => error);
      }

      /*
       * 401 without refresh token means the session cannot be renewed.
       * We clear local storage and redirect to the correct login page.
       */
      if (error.status === 401) {
        tokenService.clear();

        if (user?.role) {
          router.navigateByUrl(getLoginUrlByRole(user.role));
        } else if (currentUrl.startsWith('/admin')) {
          router.navigateByUrl('/auth/admin/login');
        } else if (currentUrl.startsWith('/agent')) {
          router.navigateByUrl('/auth/agent/login');
        } else {
          router.navigateByUrl('/auth/client/login');
        }

        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};

function getLoginUrlByRole(role: string): string {
  const cleanedRole = role.replace('ROLE_', '').toUpperCase();

  if (cleanedRole === 'ADMIN') {
    return '/auth/admin/login';
  }

  if (cleanedRole === 'AGENT') {
    return '/auth/agent/login';
  }

  return '/auth/client/login';
}