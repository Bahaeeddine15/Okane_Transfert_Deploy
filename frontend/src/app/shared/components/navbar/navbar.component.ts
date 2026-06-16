import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';

import { AuthService } from '../../../core/auth/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private authService = inject(AuthService);

  @Input() portalTitle = '';
  @Input() userTitle = '';
  @Input() userSubtitle = '';
  @Input() avatarText = '';
  @Input() searchPlaceholder = 'Search...';
  @Input() showSearch = true;

  @Output() sidebarToggle = new EventEmitter<void>();

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
