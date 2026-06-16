import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';
import { UserRole } from '../models/user';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.currentUserValue;

    if (!currentUser) {
      return router.createUrlTree(['/auth/client/login']);
    }

    if (allowedRoles.includes(currentUser.role)) {
      return true;
    }

    return router.createUrlTree([
      authService.getDashboardUrlByRole(currentUser.role),
    ]);
  };
};