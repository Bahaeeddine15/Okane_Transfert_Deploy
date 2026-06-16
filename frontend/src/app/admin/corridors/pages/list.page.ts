// frontend/src/app/admin/corridors/pages/list.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CorridorsService, Corridor } from '../services/corridors.service';

@Component({
  selector: 'app-admin-corridors-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.css']
})
export class CorridorsListPage implements OnInit {
  corridors: Corridor[] = [];
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(private corridorsService: CorridorsService) {}

  ngOnInit() {
    this.loadCorridors();
  }

  loadCorridors(showLoading = true) {
    if (showLoading) {
      this.loading = true;
    }
    this.error = null;
    this.corridorsService.getAll().subscribe({
      next: (data) => {
        this.corridors = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des corridors';
        this.loading = false;
        console.error(err);
      }
    });
  }

  toggleActive(c: Corridor) {
    const newStatus = !c.active;
    this.error = null;
    this.successMessage = null;
    c.active = newStatus;

    this.corridorsService.toggleStatus(c.id!, newStatus).subscribe({
      next: () => {
        this.successMessage = newStatus
          ? 'Corridor activé avec succès. Les grilles tarifaires associées ont été réactivées.'
          : 'Corridor désactivé avec succès. Les grilles tarifaires associées ont été désactivées.';
        this.loadCorridors(false);
        setTimeout(() => this.successMessage = null, 4000);
      },
      error: (err) => {
        c.active = !newStatus;
        this.error = err.error?.message || 'Erreur lors de la mise à jour du statut';
        setTimeout(() => this.error = null, 4000);
      }
    });
  }
}
