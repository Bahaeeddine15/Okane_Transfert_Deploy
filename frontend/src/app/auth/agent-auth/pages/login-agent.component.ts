import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AgentAuthService } from '../services/agent-auth.service';
import { getLoginErrorMessage } from '../../../core/utils/helpers';

@Component({
  selector: 'app-login-agent',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-agent.component.html',
  styleUrl: './login-agent.component.css',
})
export class LoginAgentComponent {
  private fb = inject(FormBuilder);
  private agentAuthService = inject(AgentAuthService);
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

    this.agentAuthService.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ||
          '/agent/dashboard';

        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.loading = false;
        console.error('AGENT LOGIN ERROR:', error);
        this.errorMessage = getLoginErrorMessage(error);
}
    });
  }
}