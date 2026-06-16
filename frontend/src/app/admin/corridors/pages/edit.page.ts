// frontend/src/app/admin/corridors/pages/edit.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CorridorsFormComponent } from '../components/form.component';
import { CorridorsService, Corridor } from '../services/corridors.service';

@Component({
  selector: 'app-admin-corridors-edit-page',
  standalone: true,
  imports: [CommonModule, CorridorsFormComponent],
  templateUrl: './edit.page.html'
})
export class CorridorsEditPage implements OnInit {
  corridor: Corridor | null = null;
  loading = true;
  successMessage: string | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private corridorsService: CorridorsService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.corridorsService.getById(+id).subscribe({
        next: (data) => {
          this.corridor = data;
          this.loading = false;
        },
        error: () => {
          this.error = 'Erreur lors du chargement du corridor';
          setTimeout(() => this.router.navigate(['/admin/corridors']), 2000);
        }
      });
    }
  }

  onSubmit(data: any) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.error = null;
      this.successMessage = null;
      this.corridorsService.update(+id, data).subscribe({
        next: () => {
          this.successMessage = 'Corridor mis à jour avec succès';
          setTimeout(() => this.router.navigate(['/admin/corridors']), 1500);
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la mise à jour du corridor';
          console.error(err);
        }
      });
    }
  }
}
