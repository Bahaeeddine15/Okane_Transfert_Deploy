import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, map, startWith, switchMap } from 'rxjs';

import { Agency, AgencyService } from '../../services/agencies.service';

@Component({
  selector: 'app-agency-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './agency-list.component.html',
  styleUrls: ['./agency-list.component.css'],
})
export class AgencyListComponent implements OnInit {
  private agencyService = inject(AgencyService);
  private refresh$ = new BehaviorSubject<void>(undefined);

  searchControl = new FormControl('', { nonNullable: true });
  isLoading = true;
  errorMessage = '';

  agencies$ = this.refresh$.pipe(
    switchMap(() => {
      this.isLoading = true;
      return this.agencyService.getAll();
    })
  );

  filteredAgencies$ = combineLatest([
    this.agencies$,
    this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
  ]).pipe(
    map(([agencies, search]) => {
      this.isLoading = false;
      const term = search.trim().toLowerCase();

      if (!term) {
        return agencies;
      }

      return agencies.filter((agency) => agency.name.toLowerCase().includes(term));
    })
  );

  ngOnInit(): void {
    this.refresh();
  }

  deleteAgency(agency: Agency): void {
    if (!confirm(`Supprimer l agence ${agency.name} ?`)) {
      return;
    }

    this.agencyService.delete(agency.id).subscribe({
      next: () => this.refresh(),
      error: () => this.errorMessage = 'Impossible de supprimer l agence.',
    });
  }

  toggleStatus(agency: Agency): void {
    const request$ = agency.active
      ? this.agencyService.deactivate(agency.id)
      : this.agencyService.activate(agency.id);

    request$.subscribe({
      next: () => this.refresh(),
      error: () => this.errorMessage = 'Impossible de modifier le statut.',
    });
  }

  private refresh(): void {
    this.errorMessage = '';
    this.refresh$.next();
  }
}
