import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../services/notification.service';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.page.html',
  styleUrl: './notifications.page.css'
})
export class NotificationsPage implements OnInit {

  notifications: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(private notifService: NotificationsService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading = true;
    this.errorMessage = '';

    this.notifService.getAll().subscribe({
      next: (data: any[]) => {
        this.notifications = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading notifications:', err);
        this.errorMessage = 'Unable to load notifications.';
        this.loading = false;
      }
    });
  }

  getNotificationClass(type: string): string {
    switch(type?.toUpperCase()) {
      case 'TRANSFER_CREATED': return 'info';
      case 'TRANSFER_PAID': return 'success';
      case 'TRANSFER_CANCELLED': return 'error';
      case 'TRANSFER_EXPIRED': return 'warning';
      case 'SECURITY_ALERT': return 'alert';
      case 'ACCOUNT_UPDATE': return 'info';
      default: return 'default';
    }
  }

  formatDate(dateValue: any): string {
    if (!dateValue) return '';

    let date: Date;

    try {
      if (Array.isArray(dateValue)) {
        date = new Date(
          dateValue[0],
          dateValue[1] - 1,
          dateValue[2],
          dateValue[3] || 0,
          dateValue[4] || 0,
          dateValue[5] || 0
        );
      } else {
        date = new Date(dateValue);
      }

      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
      return 'Invalid date';
    }
  }

  getTypeLabel(type: string): string {
    switch(type?.toUpperCase()) {
      case 'TRANSFER_CREATED': return 'Transfer created';
      case 'TRANSFER_PAID': return 'Transfer paid';
      case 'TRANSFER_CANCELLED': return 'Transfer canceled';
      case 'TRANSFER_EXPIRED': return 'Transfer expired';
      case 'SECURITY_ALERT': return 'Security alert';
      case 'ACCOUNT_UPDATE': return 'Account updated';
      default: return type || 'Notification';
    }
  }

  markAsRead(notification: any) {
    notification.read = true;
  }
}
