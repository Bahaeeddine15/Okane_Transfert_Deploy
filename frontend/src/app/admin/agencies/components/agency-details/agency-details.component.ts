import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { Agency, AgencyService } from '../../services/agencies.service';

@Component({
  selector: 'app-agency-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './agency-details.component.html',
  styleUrls: ['./agency-details.component.css'],
})
export class AgencyDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private agencyService = inject(AgencyService);
  private cdr = inject(ChangeDetectorRef);

  agency?: Agency;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isNaN(id) || id <= 0) {
      this.errorMessage = 'Identifiant agence invalide.';
      this.isLoading = false;
      return;
    }

    this.agencyService.getById(id).pipe(
      timeout(10000),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (agency) => {
        this.agency = agency;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.getLoadErrorMessage(error);
        this.cdr.markForCheck();
      },
    });
  }

  deleteAgency(): void {
    if (!this.agency || !confirm(`Supprimer l agence ${this.agency.name} ?`)) {
      return;
    }

    this.agencyService.delete(this.agency.id).subscribe({
      next: () => this.router.navigate(['/admin/agencies']),
      error: () => {
        this.errorMessage = 'Impossible de supprimer l agence.';
        this.cdr.markForCheck();
      },
    });
  }

  toggleStatus(): void {
    if (!this.agency) {
      return;
    }

    const request$ = this.agency.active
      ? this.agencyService.deactivate(this.agency.id)
      : this.agencyService.activate(this.agency.id);

    request$.subscribe({
      next: (agency) => {
        this.agency = agency;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Impossible de modifier le statut.';
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
        return 'Vous n avez pas les droits pour consulter cette agence.';
      }

      if (error.status === 404) {
        return 'Agence introuvable.';
      }
    }

    return 'Impossible de charger cette agence. Verifiez que le backend repond.';
  }
}
