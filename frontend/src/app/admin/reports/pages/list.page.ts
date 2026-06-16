import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';

import { ReportResult, ReportsService } from '../services/reports.service';

@Component({
  selector: 'app-admin-reports-list-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.css'],
})
export class ReportsListPage {
  private fb = inject(FormBuilder);
  private reportsService = inject(ReportsService);

  filtersForm = this.fb.nonNullable.group({
    startDate: [''],
    endDate: [''],
    agencyId: [0],
    status: [''],
  });

  report$ = this.filtersForm.valueChanges.pipe(
    startWith(this.filtersForm.getRawValue()),
    switchMap(() => {
      const filters = this.filtersForm.getRawValue();

      return this.reportsService.getTransferReport({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        agencyId: filters.agencyId || null,
        status: filters.status as any,
      });
    })
  );

  resetFilters(): void {
    this.filtersForm.reset({
      startDate: '',
      endDate: '',
      agencyId: 0,
      status: '',
    });
  }

  generatePdf(report: ReportResult): void {
    const filters = this.filtersForm.getRawValue();
    const markdown = this.reportsService.toMarkdownReport(report, {
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      agencyId: filters.agencyId || null,
      status: filters.status as any,
    });
    const html = this.reportsService.markdownToHtml(markdown);
    const reportWindow = window.open('', '_blank');

    if (!reportWindow) {
      return;
    }

    reportWindow.document.write(`
      <!doctype html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <title>Rapport des transferts</title>
          <style>
            body { color: #0f172a; font-family: Arial, sans-serif; margin: 32px; }
            h1 { font-size: 28px; margin: 0 0 12px; }
            h2 { border-bottom: 1px solid #e2e8f0; font-size: 18px; margin: 28px 0 12px; padding-bottom: 6px; }
            p, li { color: #334155; font-size: 13px; line-height: 1.5; }
            table { border-collapse: collapse; font-size: 11px; margin-top: 12px; width: 100%; }
            th, td { border: 1px solid #e2e8f0; padding: 7px 8px; text-align: left; vertical-align: top; }
            th { background: #f8fafc; color: #0f172a; }
            @page { margin: 14mm; size: landscape; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  }
}
