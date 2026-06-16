// frontend/src/app/admin/fees/pages/edit.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FeesFormComponent } from '../components/form.component';
import { FeesService, PricingGrid } from '../services/fees.service';

@Component({
  selector: 'app-admin-fees-edit-page',
  standalone: true,
  imports: [CommonModule, FeesFormComponent],
  templateUrl: './edit.page.html'
})
export class FeesEditPage implements OnInit {
  fee: PricingGrid | null = null;
  loading = true;
  successMessage: string | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private feesService: FeesService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.feesService.getById(+id).subscribe({
        next: (data) => {
          this.fee = data;
          this.loading = false;
        },
        error: () => {
          this.error = 'Erreur lors du chargement de la grille tarifaire';
          this.loading = false;
          setTimeout(() => this.router.navigate(['/admin/fees']), 2000);
        }
      });
    }
  }

  onSubmit(data: any) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.error = null;
      this.successMessage = null;
      this.feesService.update(+id, data).subscribe({
        next: () => {
          this.successMessage = 'Grille tarifaire mise à jour avec succès';
          setTimeout(() => this.router.navigate(['/admin/fees']), 1500);
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la mise à jour de la grille tarifaire';
          console.error(err);
        }
      });
    }
  }
}
