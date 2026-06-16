// frontend/src/app/admin/corridors/pages/create.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CorridorsFormComponent } from '../components/form.component';
import { CorridorsService } from '../services/corridors.service';

@Component({
  selector: 'app-admin-corridors-create-page',
  standalone: true,
  imports: [CommonModule, CorridorsFormComponent],
  templateUrl: './create.page.html'
})
export class CorridorsCreatePage {
  successMessage: string | null = null;
  error: string | null = null;

  constructor(
    private corridorsService: CorridorsService,
    private router: Router
  ) {}

  onSubmit(data: any) {
    this.error = null;
    this.successMessage = null;
    this.corridorsService.create(data).subscribe({
      next: () => {
        this.successMessage = 'Corridor créé avec succès';
        setTimeout(() => this.router.navigate(['/admin/corridors']), 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création du corridor';
        console.error(err);
      }
    });
  }
}
