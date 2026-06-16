import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Corridor } from '../services/corridors.service';

@Component({
  selector: 'app-corridors-table',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <table>
      <thead>
        <tr>
          <th>Source</th>
          <th>Destination</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let corridor of corridors">
          <td>{{ corridor.sourceCountryName }}</td>
          <td>{{ corridor.destinationCountryName }}</td>
          <td>{{ corridor.active ? 'Active' : 'Inactive' }}</td>
          <td>
            <a [routerLink]="['/admin/corridors', corridor.id, 'edit']" class="btn-edit">Edit</a>
            <button (click)="onDelete.emit(corridor.id)" class="btn-delete">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; }
    th, td { padding: 14px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f8fafc; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
    .btn-edit { color: #2563eb; text-decoration: none; font-weight: 700; margin-right: 10px; }
    .btn-delete { background: #fee2e2; color: #991b1b; border: none; border-radius: 8px; padding: 7px 10px; cursor: pointer; font-weight: 700; }
  `]
})
export class CorridorsTableComponent {
  @Input() corridors: Corridor[] = [];
  @Output() onDelete = new EventEmitter<number | undefined>();
}
