import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { Agent, AgentService } from '../../../agents/services/agent.service';
import { CountriesService, Country } from '../../../countries/services/countries.service';
import { AgencyCashRegister, AgencyRequest, AgencyService } from '../../services/agencies.service';

@Component({
  selector: 'app-agency-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './agency-form.component.html',
  styleUrls: ['./agency-form.component.css'],
})
export class AgencyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private agencyService = inject(AgencyService);
  private agentService = inject(AgentService);
  private countriesService = inject(CountriesService);
  private cdr = inject(ChangeDetectorRef);

  agencyId: number | null = null;
  isSubmitting = false;
  isLoading = false;
  errorMessage = '';
  agents: Agent[] = [];
  countries: Country[] = [];

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    address: ['', [Validators.required, Validators.maxLength(180)]],
    active: [true],
    dailyLimit: [0, [Validators.required, Validators.min(0)]],
    countryId: [0],
  });

  cashRegisterForms = this.fb.array<ReturnType<AgencyFormComponent['createCashRegisterForm']>>([]);

  get isEditMode(): boolean {
    return this.agencyId !== null;
  }

  get agencyAgents(): Agent[] {
    if (!this.agencyId) {
      return [];
    }

    return this.agents.filter((agent) => agent.agencyId === this.agencyId);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCountries();

    if (!Number.isNaN(id) && id > 0) {
      this.agencyId = id;
      this.loadAgents();
      this.loadAgency(id);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const payload: AgencyRequest = {
      name: formValue.name,
      address: formValue.address,
      active: formValue.active,
      dailyLimit: formValue.dailyLimit,
      countryIds: formValue.countryId > 0 ? [formValue.countryId] : [],
      agentCodes: [],
      cashRegisterCount: undefined,
      cashRegisters: this.isEditMode ? this.cashRegisterForms.getRawValue() : [],
    };

    const request$ = this.isEditMode && this.agencyId
      ? this.agencyService.update(this.agencyId, payload)
      : this.agencyService.create(payload);

    this.isSubmitting = true;
    this.errorMessage = '';

    request$.subscribe({
      next: (agency) => this.router.navigate(['/admin/agencies', agency.id]),
      error: () => {
        this.errorMessage = 'Impossible d enregistrer l agence.';
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  formatAgent(agent: Agent): string {
    const fullName = [agent.firstName, agent.lastName].filter(Boolean).join(' ').trim();
    const code = agent.agentCode || `Agent ${agent.id}`;
    return fullName ? `${code} - ${fullName}` : code;
  }

  private loadAgency(id: number): void {
    this.isLoading = true;

    this.agencyService.getById(id).pipe(
      timeout(10000),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (agency) => {
        this.form.patchValue({
          name: agency.name,
          address: agency.address,
          active: agency.active,
          dailyLimit: agency.dailyLimit,
          countryId: agency.countryIds?.[0] || 0,
        });
        this.setCashRegisters(agency.cashRegisters || []);
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.getLoadErrorMessage(error);
        this.cdr.markForCheck();
      },
    });
  }

  private loadCountries(): void {
    this.countriesService.getAll().pipe(
      timeout(10000)
    ).subscribe({
      next: (countries) => {
        this.countries = countries.filter((country) => country.active);
        this.cdr.markForCheck();
      },
      error: () => {
        this.countries = [];
        this.cdr.markForCheck();
      },
    });
  }

  private loadAgents(): void {
    this.agentService.getAll().pipe(
      timeout(10000)
    ).subscribe({
      next: (agents) => {
        this.agents = agents.filter((agent) => agent.status);
        this.cdr.markForCheck();
      },
      error: () => {
        this.agents = [];
        this.cdr.markForCheck();
      },
    });
  }

  private setCashRegisters(cashRegisters: AgencyCashRegister[]): void {
    this.cashRegisterForms.clear();

    cashRegisters
      .slice()
      .sort((left, right) => left.id - right.id)
      .forEach((cashRegister) => {
        this.cashRegisterForms.push(this.createCashRegisterForm(cashRegister));
      });
  }

  private createCashRegisterForm(cashRegister: AgencyCashRegister) {
    return this.fb.nonNullable.group({
      id: [cashRegister.id],
      active: [!cashRegister.closed],
      agentCode: [cashRegister.agent?.agentCode || ''],
    });
  }

  private getLoadErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Session expiree ou non autorisee. Reconnectez-vous en admin.';
      }

      if (error.status === 403) {
        return 'Vous n avez pas les droits pour modifier cette agence.';
      }

      if (error.status === 404) {
        return 'Agence introuvable.';
      }
    }

    return 'Impossible de charger cette agence. Verifiez que le backend repond.';
  }
}
