import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { AgencyService } from '../../agencies/services/agencies.service';
import { JournalAudit, ReportTransfer, ReportsService } from '../../reports/services/reports.service';

export interface AuditRow {
  id: number;
  action: string;
  detail: string;
  agencyName: string;
  agentCode: string;
  transferReference: string;
  transferStatus: string;
  transferAmount: string;
  timeStamp?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private reportsService = inject(ReportsService);
  private agencyService = inject(AgencyService);

  getAll(): Observable<JournalAudit[]> {
    return this.reportsService.getJournalAudit();
  }

  getRows(): Observable<AuditRow[]> {
    return forkJoin({
      audits: this.getAll(),
      agencies: this.agencyService.getAll(),
      transfers: this.reportsService.getTransfers(),
    }).pipe(
      map(({ audits, agencies, transfers }) => {
        const agencyById = new Map(agencies.map((agency) => [agency.id, agency.name]));
        const transferById = new Map(transfers.map((transfer) => [transfer.id, transfer]));

        return audits
          .map((audit) => this.toRow(audit, agencyById, transferById))
          .sort((left, right) => this.toTime(right.timeStamp) - this.toTime(left.timeStamp));
      })
    );
  }

  private toRow(
    audit: JournalAudit,
    agencyById: Map<number, string>,
    transferById: Map<number, ReportTransfer>
  ): AuditRow {
    const transfer = audit.transferId ? transferById.get(audit.transferId) : undefined;

    return {
      id: audit.id,
      action: audit.action,
      detail: audit.detail || '-',
      agencyName: audit.agencyId ? agencyById.get(audit.agencyId) || `Agence #${audit.agencyId}` : '-',
      agentCode: audit.agentCode || transfer?.agentName || '-',
      transferReference: transfer?.payoutCode || (audit.transferId ? `Transfert #${audit.transferId}` : '-'),
      transferStatus: transfer?.status || '-',
      transferAmount: transfer ? this.formatTransferAmount(transfer) : '-',
      timeStamp: audit.timeStamp,
    };
  }

  private formatTransferAmount(transfer: ReportTransfer): string {
    const amount = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(transfer.sentAmount || 0);

    return `${amount} ${transfer.sendingCurrency || ''}`.trim();
  }

  private toTime(value?: string): number {
    return value ? new Date(value).getTime() : 0;
  }
}
