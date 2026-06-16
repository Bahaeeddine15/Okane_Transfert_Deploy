import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ClientAuthService } from '../services/client-auth.service';
import { ClientRegisterRequest } from '../../../core/auth/models/auth';

@Component({
  selector: 'app-signup-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup-client.component.html',
  styleUrl: './signup-client.component.css',
})
export class SignupClientComponent {
  private fb = inject(FormBuilder);
  private clientAuthService = inject(ClientAuthService);

  loading = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      cin: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [this.passwordsMatchValidator],
    }
  );

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();

    const payload: ClientRegisterRequest = {
      firstName: rawValue.firstName.trim(),
      lastName: rawValue.lastName.trim(),
      email: rawValue.email.trim().toLowerCase(),
      cin: rawValue.cin.trim(),
      phoneNumber: rawValue.phoneNumber.trim(),
      password: rawValue.password,
    };

    this.loading = true;

    this.clientAuthService.register(payload).subscribe({
      next: (response: any) => {
        this.loading = false;

        this.successMessage =
          response?.message ||
          'Client account created successfully. Please verify your email before signing in.';

        this.errorMessage = '';
        this.form.reset();
      },
      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          error?.error?.error ||
          error?.message ||
          'Unable to create the client account.';

        this.successMessage = '';
      },
    });
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordsMismatch: true };
  }
}
