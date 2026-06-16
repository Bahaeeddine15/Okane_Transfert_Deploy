import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth';
import { CashRegisterService } from '../../services/cash-register.service';

export const openCashRegisterGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const cashRegisterService = inject(CashRegisterService);
  const router = inject(Router);
  const agentId = authService.currentUserValue?.id;

  if (!agentId) {
    return router.createUrlTree(['/agent/cash']);
  }

  return cashRegisterService.getCurrentForAgent(agentId).pipe(
    map((cashRegister) => cashRegister?.status === 'OPEN' ? true : router.createUrlTree(['/agent/cash'])),
    catchError(() => of(router.createUrlTree(['/agent/cash'])))
  );
};
