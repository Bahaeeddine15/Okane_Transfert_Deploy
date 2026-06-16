import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';
import { API_BASE_URL } from '../../core/utils/constants';

interface Stat {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-agent-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css',
})
export class AgentDashboardPage implements OnInit {
  private http = inject(HttpClient);

  stats: Stat[] = [];
  loading = true;
  error: string | null = null;

  name = 'Agent';
  recentTransfers: any[] = [];

  ngOnInit(): void {
    forkJoin({
      transfers: this.http.get<any[]>(`${API_BASE_URL}/transfers/my-transfers`).pipe(catchError(() => of([] as any[]))),
      agent:     this.http.get<any>(`${API_BASE_URL}/agents/me`).pipe(catchError(() => of(null)))
    }).subscribe(({ transfers, agent }) => {
      const pending = transfers.filter((t: any) => t.status === 'PENDING');
      const pendingAmount = pending.reduce((s: number, t: any) => s + (t.sentAmount || 0), 0);

      this.name = agent ? `${agent.firstName} ${agent.lastName}` : 'Agent';
      this.recentTransfers = transfers.slice(0, 5);
      this.stats = [
        { label: 'Transfers',       value: transfers.length },
        { label: 'Pending',         value: pending.length },
        { label: 'Pending Amount',  value: this.formatAmount(pendingAmount) },
        { label: 'Clients Served',  value: new Set([...transfers.map((t: any) => t.senderName), ...transfers.map((t: any) => t.beneficiaryName)]).size },
      ];
      this.loading = false;
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  }
}