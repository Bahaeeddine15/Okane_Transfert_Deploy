// frontend/src/app/admin/fees/pages/list.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FeesService, PricingGrid } from '../services/fees.service';
import { CorridorsService, Corridor } from '../../corridors/services/corridors.service';

@Component({
  selector: 'app-admin-fees-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.css']
})
export class FeesListPage implements OnInit {
  fees: PricingGrid[] = [];
  corridors: Corridor[] = [];
  selectedCorridorId: number | null = null;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private feesService: FeesService,
    private corridorsService: CorridorsService
  ) {}

  ngOnInit() {
    this.loadCorridors();
    this.loadFees();
  }

  loadCorridors() {
    this.corridorsService.getAll().subscribe({
      next: (data) => { this.corridors = data; },
      error: (err) => { console.error(err); }
    });
  }

  loadFees() {
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const observable = this.selectedCorridorId
      ? this.feesService.getByCorridor(this.selectedCorridorId)
      : this.feesService.getAll();

    observable.subscribe({
      next: (data) => {
        this.fees = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des grilles tarifaires';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onFilterChange() {
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    if (this.selectedCorridorId) {
      this.feesService.getByCorridor(this.selectedCorridorId).subscribe({
        next: (data) => { this.fees = data; this.loading = false; },
        error: (err) => { this.error = err.error?.message || 'Erreur lors du chargement'; this.loading = false; }
      });
    } else {
      this.feesService.getAll().subscribe({
        next: (data) => { this.fees = data; this.loading = false; },
        error: (err) => { this.error = 'Erreur lors du chargement des grilles tarifaires'; this.loading = false; }
      });
    }
  }

  delete(id: number | undefined) {
    if (!id) return;
    this.error = null;
    this.successMessage = null;
    this.feesService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Grille tarifaire supprimée avec succès';
        this.loadFees();
        setTimeout(() => this.successMessage = null, 4000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la suppression';
        console.error(err);
      }
    });
  }
}
