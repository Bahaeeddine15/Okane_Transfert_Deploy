import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import { JournalAudit, ReportsService } from '../../reports/services/reports.service';
import { DashboardService } from '../services/dashboard.service';
import { TransferSummary } from '../models/dashboard.model';

interface DashboardViewModel {
  totalTransfers: number;
  totalAgencies: number;
  totalAgents: number;
  auditEntries: number;
  totalRevenue: number;
  recentTransfers: TransferSummary[];
  recentAudits: JournalAudit[];
}

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.css'],
})
export class DashboardPage {
  private dashboardService = inject(DashboardService);
  private reportsService = inject(ReportsService);

  vm$: Observable<DashboardViewModel> = forkJoin({
    statistics: this.dashboardService.getStatistics(),
    transfers: this.dashboardService.getTransfers(),
    audits: this.reportsService.getJournalAudit().pipe(catchError(() => of([] as JournalAudit[]))),
  }).pipe(
    map(({ statistics, transfers, audits }) => ({
      totalTransfers: statistics.totalTransfers,
      totalAgencies: statistics.totalAgencies,
      totalAgents: statistics.totalAgents,
      auditEntries: audits.length,
      totalRevenue: statistics.totalRevenue,
      recentTransfers: this.sortByDate(transfers, 'createdAt').slice(0, 5),
      recentAudits: this.sortByDate(audits, 'timeStamp').slice(0, 5),
    }))
  );

  private sortByDate<T>(items: T[], key: keyof T): T[] {
    return [...items].sort((a, b) => {
      const left = this.toTime(a[key]);
      const right = this.toTime(b[key]);

      return right - left;
    });
  }

  private toTime(value: unknown): number {
    return typeof value === 'string' ? new Date(value).getTime() || 0 : 0;
  }
}
