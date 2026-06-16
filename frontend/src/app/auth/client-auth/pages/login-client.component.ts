import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ClientAuthService } from '../services/client-auth.service';
import { getLoginErrorMessage } from '../../../core/utils/helpers';

@Component({
  selector: 'app-login-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-client.component.html',
  styleUrl: './login-client.component.css',
})
export class LoginClientComponent {
  private fb = inject(FormBuilder);
  private clientAuthService = inject(ClientAuthService);
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

  this.clientAuthService.login(this.form.getRawValue()).subscribe({
    next: () => {
      const returnUrl =
        this.route.snapshot.queryParamMap.get('returnUrl') ||
        '/client/dashboard';

      this.router.navigateByUrl(returnUrl);
    },
    error: (error) => {
      this.loading = false;
      console.error('CLIENT LOGIN ERROR:', error);
      this.errorMessage = getLoginErrorMessage(error);
    }
  });
}
}