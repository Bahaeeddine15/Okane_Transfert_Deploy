import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminAuthService } from '../services/admin-auth.service';
import { getLoginErrorMessage } from '../../../core/utils/helpers';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-admin.component.html',
  styleUrl: './login-admin.component.css',
})
export class LoginAdminComponent {
  private fb = inject(FormBuilder);
  private adminAuthService = inject(AdminAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  errorMessage = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.adminAuthService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;

        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ||
          '/admin/dashboard';

        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.loading = false;
        console.error('ADMIN LOGIN ERROR:', error);
        this.errorMessage = getLoginErrorMessage(error);
      }
    });
  }
}