import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-agent-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NavbarComponent,
  ],
  templateUrl: './agent-layout.component.html',
  styleUrl: './agent-layout.component.css',
})
export class AgentLayoutComponent {
  isSidebarOpen = true;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}