import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth';
import { LoginRequest } from '../../../core/auth/models/auth';
import { AuthUser } from '../../../core/auth/models/user';

@Injectable({
  providedIn: 'root',
})
export class AgentAuthService {
  private authService = inject(AuthService);

  login(request: LoginRequest): Observable<AuthUser> {
    return this.authService.login(request, 'AGENT');
  }

  logout(): void {
    this.authService.logout();
  }
}