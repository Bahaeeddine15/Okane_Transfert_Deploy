import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';

import { TokenService } from '../services/token';

type UserRole = 'ADMIN' | 'AGENT' | 'CLIENT';

export const authRoleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    return checkAccess(allowedRoles, state.url);
  };
};

export const authRoleChildGuard = (
  allowedRoles: UserRole[]
): CanActivateChildFn => {
  return (childRoute, state) => {
    return checkAccess(allowedRoles, state.url);
  };
};

function checkAccess(allowedRoles: UserRole[], attemptedUrl: string) {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  const accessToken = tokenService.getToken();
  const refreshToken = tokenService.getRefreshToken();
  const user = tokenService.getUser();

  const hasSessionToken = !!accessToken || !!refreshToken;

  /*
   * Not logged in:
   * redirect to the login page of the protected section.
   * Example: /agent/dashboard -> /auth/agent/login
   */
  if (!user || !hasSessionToken) {
    tokenService.clear();

    return redirectToLoginByExpectedRole(router, allowedRoles[0], attemptedUrl);
  }

  const role = normalizeRole(user.role);

  /*
   * Logged in but wrong role.
   * Example: ADMIN trying to open /agent/dashboard.
   */
  if (!role || !allowedRoles.includes(role)) {
    return router.createUrlTree(['/unauthorized']);
  }

  return true;
}

function redirectToLoginByExpectedRole(
  router: Router,
  expectedRole: UserRole,
  attemptedUrl: string
) {
  if (expectedRole === 'ADMIN') {
    return router.createUrlTree(['/auth/admin/login'], {
      queryParams: { returnUrl: attemptedUrl },
    });
  }

  if (expectedRole === 'AGENT') {
    return router.createUrlTree(['/auth/agent/login'], {
      queryParams: { returnUrl: attemptedUrl },
    });
  }

  return router.createUrlTree(['/auth/client/login'], {
    queryParams: { returnUrl: attemptedUrl },
  });
}

function normalizeRole(role: any): UserRole | null {
  if (!role || typeof role !== 'string') {
    return null;
  }

  const cleaned = role.replace('ROLE_', '').toUpperCase();

  if (cleaned === 'ADMIN') return 'ADMIN';
  if (cleaned === 'AGENT') return 'AGENT';
  if (cleaned === 'CLIENT') return 'CLIENT';

  return null;
}