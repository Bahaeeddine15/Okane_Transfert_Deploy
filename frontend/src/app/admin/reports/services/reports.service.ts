import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { Agency, AgencyService } from '../../agencies/services/agencies.service';
import { API_BASE_URL } from '../../../core/utils/constants';

export interface JournalAudit {
  id: number;
  action: string;
  detail?: string;
  timeStamp?: string;
  agencyId?: number;
  agentCode?: string;
  transferId?: number;
}

export type ReportStatus = '' | 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELED';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  agencyId?: number | null;
  status?: ReportStatus;
}

export interface ReportTransfer {
  id: number;
  payoutCode?: string;
  sentAmount: number;
  receivedAmount: number;
  cost: number;
  sendingCurrency?: string;
  receivedCurrency?: string;
  status: Exclude<ReportStatus, ''>;
  payoutMethod?: string;
  createdAt?: string;
  senderName?: string;
  beneficiaryName?: string;
  agentName?: string;
}

export interface ReportRow {
  transferId: number;
  payoutCode: string;
  createdAt?: string;
  agencyId?: number;
  agencyName: string;
  agentName: string;
  senderName: string;
  beneficiaryName: string;
  status: string;
  sentAmount: number;
  revenue: number;
  commission: number;
  withdrawal: number;
  currency: string;
}

export interface ReportSummary {
  totalTransfers: number;
  totalRevenue: number;
  totalCommissions: number;
  totalWithdrawals: number;
}

export interface ReportResult {
  summary: ReportSummary;
  rows: ReportRow[];
  agencies: Agency[];
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private http = inject(HttpClient);
  private agencyService = inject(AgencyService);
  private baseUrl = `${API_BASE_URL}/audits`;

  getJournalAudit(): Observable<JournalAudit[]> {
    return this.http.get<JournalAudit[]>(this.baseUrl);
  }

  getTransfers(): Observable<ReportTransfer[]> {
    return this.http.get<ReportTransfer[]>(`${API_BASE_URL}/transfers`);
  }

  getTransferReport(filters: ReportFilters): Observable<ReportResult> {
    return forkJoin({
      transfers: this.getTransfers(),
      audits: this.getJournalAudit(),
      agencies: this.agencyService.getAll(),
    }).pipe(
      map(({ transfers, audits, agencies }) => {
        const agencyById = new Map(agencies.map((agency) => [agency.id, agency]));
        const agencyIdByTransferId = this.mapAgencyIdsByTransfer(audits);
        const rows = transfers
          .map((transfer) => this.toReportRow(transfer, agencyIdByTransferId, agencyById))
          .filter((row) => this.matchesFilters(row, filters));

        return {
          summary: this.toSummary(rows),
          rows,
          agencies,
        };
      })
    );
  }

  toMarkdownReport(report: ReportResult, filters: ReportFilters): string {
    const generatedAt = new Date().toLocaleString();
    const selectedAgency = filters.agencyId
      ? report.agencies.find((agency) => agency.id === filters.agencyId)?.name || `Agence #${filters.agencyId}`
      : 'Toutes les agences';

    const rows = report.rows.map((row) =>
      [
        this.markdownCell(this.formatDate(row.createdAt)),
        this.markdownCell(row.payoutCode),
        this.markdownCell(row.agencyName),
        this.markdownCell(row.agentName),
        this.markdownCell(row.senderName),
        this.markdownCell(row.beneficiaryName),
        this.markdownCell(row.status),
        this.markdownCell(`${this.formatNumber(row.sentAmount)} ${row.currency}`.trim()),
        this.markdownCell(this.formatNumber(row.revenue)),
        this.markdownCell(this.formatNumber(row.commission)),
        this.markdownCell(this.formatNumber(row.withdrawal)),
      ].join(' | ')
    );

    return [
      '# Rapport des transferts',
      '',
      `Genere le: ${generatedAt}`,
      '',
      '## Filtres',
      '',
      `- Du: ${filters.startDate || 'Debut'}`,
      `- Au: ${filters.endDate || 'Aujourd hui'}`,
      `- Agence: ${selectedAgency}`,
      `- Statut: ${filters.status || 'Tous les statuts'}`,
      '',
      '## Resume',
      '',
      `- Total transfers: ${report.summary.totalTransfers}`,
      `- Total revenue: ${this.formatNumber(report.summary.totalRevenue)}`,
      `- Total commissions: ${this.formatNumber(report.summary.totalCommissions)}`,
      `- Total withdrawals: ${this.formatNumber(report.summary.totalWithdrawals)}`,
      '',
      '## Details',
      '',
      '| Date | Reference | Agence | Agent | Client | Beneficiaire | Statut | Montant | Revenu | Commission | Retrait |',
      '| --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: |',
      ...(rows.length ? rows.map((row) => `| ${row} |`) : ['| Aucun resultat | - | - | - | - | - | - | - | - | - | - |']),
      '',
    ].join('\n');
  }

  markdownToHtml(markdown: string): string {
    const lines = markdown.split('\n');
    const html: string[] = [];
    let inList = false;
    let inTable = false;

    lines.forEach((line) => {
      if (line.startsWith('|')) {
        if (!inTable) {
          html.push('<table>');
          inTable = true;
        }

        if (/^\|\s*-+/.test(line)) {
          return;
        }

        const cells = line
          .slice(1, -1)
          .split('|')
          .map((cell) => cell.trim());
        const tag = html[html.length - 1] === '<table>' ? 'th' : 'td';
        html.push(`<tr>${cells.map((cell) => `<${tag}>${this.escapeHtml(cell)}</${tag}>`).join('')}</tr>`);
        return;
      }

      if (inTable) {
        html.push('</table>');
        inTable = false;
      }

      if (line.startsWith('- ')) {
        if (!inList) {
          html.push('<ul>');
          inList = true;
        }
        html.push(`<li>${this.escapeHtml(line.slice(2))}</li>`);
        return;
      }

      if (inList) {
        html.push('</ul>');
        inList = false;
      }

      if (line.startsWith('# ')) {
        html.push(`<h1>${this.escapeHtml(line.slice(2))}</h1>`);
      } else if (line.startsWith('## ')) {
        html.push(`<h2>${this.escapeHtml(line.slice(3))}</h2>`);
      } else if (line.trim()) {
        html.push(`<p>${this.escapeHtml(line)}</p>`);
      }
    });

    if (inTable) {
      html.push('</table>');
    }

    if (inList) {
      html.push('</ul>');
    }

    return html.join('\n');
  }

  private mapAgencyIdsByTransfer(audits: JournalAudit[]): Map<number, number> {
    const agencyIdByTransferId = new Map<number, number>();

    audits.forEach((audit) => {
      if (audit.transferId && audit.agencyId) {
        agencyIdByTransferId.set(audit.transferId, audit.agencyId);
      }
    });

    return agencyIdByTransferId;
  }

  private toReportRow(
    transfer: ReportTransfer,
    agencyIdByTransferId: Map<number, number>,
    agencyById: Map<number, Agency>
  ): ReportRow {
    const agencyId = agencyIdByTransferId.get(transfer.id);
    const agency = agencyId ? agencyById.get(agencyId) : undefined;
    const revenue = transfer.cost || 0;

    return {
      transferId: transfer.id,
      payoutCode: transfer.payoutCode || String(transfer.id),
      createdAt: transfer.createdAt,
      agencyId,
      agencyName: agency?.name || '-',
      agentName: transfer.agentName || '-',
      senderName: transfer.senderName || '-',
      beneficiaryName: transfer.beneficiaryName || '-',
      status: transfer.status || 'PENDING',
      sentAmount: transfer.sentAmount || 0,
      revenue,
      commission: revenue,
      withdrawal: transfer.status === 'PAID' ? transfer.receivedAmount || 0 : 0,
      currency: transfer.sendingCurrency || '',
    };
  }

  private matchesFilters(row: ReportRow, filters: ReportFilters): boolean {
    if (filters.status && row.status !== filters.status) {
      return false;
    }

    if (filters.agencyId && row.agencyId !== filters.agencyId) {
      return false;
    }

    const createdAt = row.createdAt ? new Date(row.createdAt) : null;

    if (filters.startDate && createdAt && createdAt < new Date(filters.startDate)) {
      return false;
    }

    if (filters.endDate && createdAt) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);

      if (createdAt > endDate) {
        return false;
      }
    }

    return true;
  }

  private toSummary(rows: ReportRow[]): ReportSummary {
    return rows.reduce(
      (summary, row) => ({
        totalTransfers: summary.totalTransfers + 1,
        totalRevenue: summary.totalRevenue + row.revenue,
        totalCommissions: summary.totalCommissions + row.commission,
        totalWithdrawals: summary.totalWithdrawals + row.withdrawal,
      }),
      {
        totalTransfers: 0,
        totalRevenue: 0,
        totalCommissions: 0,
        totalWithdrawals: 0,
      }
    );
  }

  private formatDate(value?: string): string {
    return value ? new Date(value).toLocaleDateString() : '-';
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  private markdownCell(value: string): string {
    return value.replace(/\|/g, '\\|');
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
