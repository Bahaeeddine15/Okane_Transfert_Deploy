import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Agent, AgentsService } from '../services/agents.service';

@Component({
  selector: 'app-admin-agents-list-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.css'],
})
export class AgentsListPage {
  private agentsService = inject(AgentsService);

  agents$: Observable<Agent[]> = this.agentsService.getAll();
}
