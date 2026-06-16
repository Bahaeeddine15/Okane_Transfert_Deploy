import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { Agent, AgentService } from '../../services/agent.service';

@Component({
  selector: 'app-agent-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './agent-details.component.html',
  styleUrls: ['./agent-details.component.css'],
})
export class AgentDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private agentService = inject(AgentService);
  private cdr = inject(ChangeDetectorRef);

  agent?: Agent;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isNaN(id) || id <= 0) {
      this.errorMessage = 'Identifiant agent invalide.';
      this.isLoading = false;
      return;
    }

    this.loadAgent(id);
  }

  deleteAgent(): void {
    if (!this.agent || !confirm(`Supprimer l agent ${this.agent.firstName} ${this.agent.lastName} ?`)) {
      return;
    }

    this.agentService.delete(this.agent.id).subscribe({
      next: () => this.router.navigate(['/admin/agents']),
      error: () => {
        this.errorMessage = 'Impossible de supprimer l agent.';
        this.cdr.markForCheck();
      },
    });
  }

  toggleStatus(): void {
    if (!this.agent) {
      return;
    }

    const request$ = this.agent.status
      ? this.agentService.deactivate(this.agent.id)
      : this.agentService.activate(this.agent.id);

    request$.subscribe({
      next: () => this.loadAgent(this.agent?.id || 0),
      error: () => {
        this.errorMessage = 'Impossible de modifier le statut.';
        this.cdr.markForCheck();
      },
    });
  }

  private loadAgent(id: number): void {
    this.isLoading = true;

    this.agentService.getById(id).pipe(
      timeout(10000),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (agent) => {
        this.agent = agent;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.getLoadErrorMessage(error);
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
        return 'Vous n avez pas les droits pour consulter cet agent.';
      }

      if (error.status === 404) {
        return 'Agent introuvable.';
      }
    }

    return 'Impossible de charger cet agent. Verifiez que le backend repond.';
  }
}
