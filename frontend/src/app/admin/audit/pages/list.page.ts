import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AuditRow, AuditService } from '../services/audit.service';

@Component({
  selector: 'app-admin-audit-list-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.css'],
})
export class AuditListPage {
  private auditService = inject(AuditService);

  events$: Observable<AuditRow[]> = this.auditService.getRows();
}
