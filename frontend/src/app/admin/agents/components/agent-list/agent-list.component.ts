import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';

import { Agent, AgentService } from '../../services/agent.service';

@Component({
  selector: 'app-agent-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.css'],
})
export class AgentListComponent implements OnInit {
  private agentService = inject(AgentService);
  private refresh$ = new BehaviorSubject<void>(undefined);

  searchControl = new FormControl('', { nonNullable: true });
  isLoading = true;
  errorMessage = '';

  agents$ = this.refresh$.pipe(
    switchMap(() => {
      this.isLoading = true;
      return this.agentService.getAll().pipe(
        catchError(() => {
          this.errorMessage = 'Impossible de charger les agents.';
          this.isLoading = false;
          return of([] as Agent[]);
        })
      );
    })
  );

  filteredAgents$ = combineLatest([
    this.agents$,
    this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
  ]).pipe(
    map(([agents, search]) => {
      this.isLoading = false;
      const term = search.trim().toLowerCase();

      if (!term) {
        return agents;
      }

      return agents.filter((agent) =>
        `${agent.firstName} ${agent.lastName} ${agent.email}`.toLowerCase().includes(term)
      );
    })
  );

  ngOnInit(): void {
    this.refresh();
  }

  deleteAgent(agent: Agent): void {
    if (!confirm(`Supprimer l agent ${agent.firstName} ${agent.lastName} ?`)) {
      return;
    }

    this.agentService.delete(agent.id).subscribe({
      next: () => this.refresh(),
      error: () => this.errorMessage = 'Impossible de supprimer l agent.',
    });
  }

  toggleStatus(agent: Agent): void {
    if (!agent.status && agent.agencyActive === false) {
      this.errorMessage = `Impossible d'activer l'agent ${agent.firstName} ${agent.lastName} : son agence est inactive.`;
      return;
    }

    const request$ = agent.status
      ? this.agentService.deactivate(agent.id)
      : this.agentService.activate(agent.id);

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
