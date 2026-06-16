// frontend/src/app/admin/fees/pages/create.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FeesFormComponent } from '../components/form.component';
import { FeesService } from '../services/fees.service';

@Component({
  selector: 'app-admin-fees-create-page',
  standalone: true,
  imports: [CommonModule, FeesFormComponent],
  templateUrl: './create.page.html'
})
export class FeesCreatePage {
  successMessage: string | null = null;
  error: string | null = null;

  constructor(
    private feesService: FeesService,
    private router: Router
  ) {}

  onSubmit(data: any) {
    this.error = null;
    this.successMessage = null;
    this.feesService.create(data).subscribe({
      next: () => {
        this.successMessage = 'Grille tarifaire créée avec succès';
        setTimeout(() => this.router.navigate(['/admin/fees']), 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création de la grille tarifaire';
        console.error(err);
      }
    });
  }
}
