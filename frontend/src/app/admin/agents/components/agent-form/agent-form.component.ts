import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, catchError, finalize, of, timeout } from 'rxjs';

import { Agency, AgencyService } from '../../../agencies/services/agencies.service';
import { AgentRequest, AgentService } from '../../services/agent.service';

@Component({
  selector: 'app-agent-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './agent-form.component.html',
  styleUrls: ['./agent-form.component.css'],
})
export class AgentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private agentService = inject(AgentService);
  private agencyService = inject(AgencyService);
  private cdr = inject(ChangeDetectorRef);

  agentId: number | null = null;
  isSubmitting = false;
  isLoading = false;
  errorMessage = '';

  agencies$: Observable<Agency[]> = this.agencyService.getAll().pipe(catchError(() => of([] as Agency[])));

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.maxLength(30)]],
    agentCode: ['', [Validators.required, Validators.maxLength(40)]],
    agencyId: [0, [Validators.required, Validators.min(1)]],
    status: [true],
    password: [''],
  });

  get isEditMode(): boolean {
    return this.agentId !== null;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isNaN(id) && id > 0) {
      this.agentId = id;
      this.loadAgent(id);
      return;
    }

    this.form.controls.password.addValidators([Validators.required, Validators.minLength(6)]);
    this.form.controls.password.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const payload: AgentRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      agentCode: formValue.agentCode,
      agencyId: formValue.agencyId,
      status: formValue.status,
      password: formValue.password || undefined,
    };

    const request$ = this.isEditMode && this.agentId
      ? this.agentService.update(this.agentId, payload)
      : this.agentService.create(payload);

    this.isSubmitting = true;
    this.errorMessage = '';

    request$.subscribe({
      next: (agent) => this.router.navigate(['/admin/agents', agent.id]),
      error: () => {
        this.errorMessage = 'Impossible d enregistrer l agent.';
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  private loadAgent(id: number): void {
    this.isLoading = true;

    this.agentService.getById(id).pipe(
      timeout(10000),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (agent) => {
        this.form.patchValue({
          firstName: agent.firstName,
          lastName: agent.lastName,
          email: agent.email,
          phone: agent.phone,
          agentCode: agent.agentCode || '',
          agencyId: agent.agencyId,
          status: agent.status,
        });
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.getLoadErrorMessage(error);
        this.cdr.markForCheck();
      },
    });
  }

  private getLoadErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Session expiree ou non autorisee. Reconnectez-vous en admin.';
      }

      if (error.status === 403) {
        return 'Vous n avez pas les droits pour modifier cet agent.';
      }

      if (error.status === 404) {
        return 'Agent introuvable.';
      }
    }

    return 'Impossible de charger cet agent. Verifiez que le backend repond.';
  }
}
