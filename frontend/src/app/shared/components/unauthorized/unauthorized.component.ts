import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { TokenService } from '../../../core/auth/services/token';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css',
})
// this component is a simple page that informs the usr that they are not allowed to access the page they tried to access 
// nd t provides a btn to go back to their dashboard 
export class UnauthorizedComponent {
  private router = inject(Router);
  private tokenService = inject(TokenService);

  goToMyDashboard(): void {
    const user = this.tokenService.getUser();
    // If for some reason we end up here without a user (shouldn't happen if the guard and interceptor are working correctly), we redirect to a generic login page.
    if (!user) {
      this.router.navigateByUrl('/auth/client/login');
      return;
    }

    if (user.role === 'ADMIN') {
      this.router.navigateByUrl('/admin/dashboard');
      return;
    }

    if (user.role === 'AGENT') {
      this.router.navigateByUrl('/agent/dashboard');
      return;
    }

    if (user.role === 'CLIENT') {
      this.router.navigateByUrl('/client/dashboard');
      return;
    }

    this.router.navigateByUrl('/auth/client/login');
  }
}