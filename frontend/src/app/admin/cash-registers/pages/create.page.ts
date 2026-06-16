import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { timeout } from 'rxjs';

import { Agent } from '../../agents/services/agent.service';
import { CashRegisterService } from '../../../core/services/cash-register.service';
import { Agency, AgencyService } from '../../agencies/services/agencies.service';

@Component({
  selector: 'app-admin-cash-register-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create.page.html',
  styleUrl: './create.page.css',
})
export class AdminCashRegisterCreatePage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private agencyService = inject(AgencyService);
  private cashRegisterService = inject(CashRegisterService);
  private cdr = inject(ChangeDetectorRef);

  agencies: Agency[] = [];
  agents: Agent[] = [];
  isLoadingAgencies = false;
  isLoadingAgents = false;
  isSubmitting = false;
  errorMessage = '';

  form = this.fb.nonNullable.group({
    agencyId: [0, [Validators.required, Validators.min(1)]],
    agentCode: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadAgencies();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { agencyId, agentCode } = this.form.getRawValue();

    this.isSubmitting = true;
    this.errorMessage = '';

    this.cashRegisterService.create({
      date: new Date().toISOString().slice(0, 10),
      openingBalance: 0,
      closingBalance: null,
      closed: false,
      agentCode,
      agencyId,
    }).subscribe({
      next: (cashRegister) => this.router.navigate(['/admin/cash-registers', cashRegister.id]),
      error: (error) => {
        this.errorMessage = this.readError(error);
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  formatAgent(agent: Agent): string {
    const fullName = [agent.firstName, agent.lastName].filter(Boolean).join(' ').trim();
    const code = agent.agentCode || `Agent ${agent.id}`;
    const agency = agent.agencyName || `Agence #${agent.agencyId}`;
    return `${code}${fullName ? ' - ' + fullName : ''} (${agency})`;
  }

  onAgencyChange(): void {
    const agencyId = this.form.controls.agencyId.value;
    this.form.controls.agentCode.setValue('');
    this.agents = [];
    this.errorMessage = '';

    if (!agencyId) {
      return;
    }

    this.loadAgentsByAgency(agencyId);
  }

  private loadAgencies(): void {
    this.isLoadingAgencies = true;

    this.agencyService.getAll().pipe(
      timeout(10000)
    ).subscribe({
      next: (agencies) => {
        this.agencies = agencies.filter((agency) => agency.active);
        this.isLoadingAgencies = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.agencies = [];
        this.isLoadingAgencies = false;
        this.errorMessage = 'Impossible de charger les agences.';
        this.cdr.markForCheck();
      },
    });
  }

  private loadAgentsByAgency(agencyId: number): void {
    this.isLoadingAgents = true;

    this.agencyService.getAgents(agencyId).pipe(
      timeout(10000)
    ).subscribe({
      next: (agents) => {
        this.agents = agents.filter((agent) => agent.status && Boolean(agent.agentCode));
        this.isLoadingAgents = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.agents = [];
        this.isLoadingAgents = false;
        this.errorMessage = 'Impossible de charger les agents de cette agence.';
        this.cdr.markForCheck();
      },
    });
  }

  private readError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error as { message?: string } | string | undefined;
      if (typeof payload === 'string') {
        return payload.includes('<html') ? 'Impossible de creer la caisse.' : payload;
      }
      if (payload?.message) {
        return payload.message;
      }
    }

    return 'Impossible de creer la caisse.';
  }
}
