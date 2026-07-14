import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { Notification } from 'src/app/models/notification.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css']
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 15;
  totalElements = 0;
  totalPages = 0;
  searchKeyword = '';
  selectedType = '';
  selectedRead: boolean | '' = '';
  selectedIds = new Set<number>();
  typeOptions = ['', 'LOW_STOCK', 'PAYMENT', 'SALE', 'PURCHASE', 'PURCHASE_RETURN', 'WASTAGE', 'SYSTEM', 'OTHER'];
  Math = Math;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getAllNotifications(this.currentPage - 1, this.pageSize, this.selectedType, this.searchKeyword, this.selectedRead)
      .subscribe({
        next: (res) => {
          this.notifications = res.content;
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.selectedIds.clear();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          Swal.fire('Error', 'Failed to load notifications', 'error');
        }
      });
  }

  onSearch(): void { this.currentPage = 1; this.loadNotifications(); }
  onTypeChange(): void { this.currentPage = 1; this.loadNotifications(); }
  onReadChange(): void { this.currentPage = 1; this.loadNotifications(); }
  resetFilters(): void {
    this.searchKeyword = '';
    this.selectedType = '';
    this.selectedRead = '';
    this.currentPage = 1;
    this.loadNotifications();
  }

  markAsRead(notif: Notification): void {
    if (notif.isRead || notif.read) return;
    this.notificationService.markAsRead((notif.notificationId || notif.id)!).subscribe(() => {
      notif.isRead = true;
      notif.read = true;
      this.loadNotifications(); // refresh counts too
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notificationService.notifyNotificationsChanged();
      this.loadNotifications();
    });
  }

  get selectedCount(): number {
    return this.selectedIds.size;
  }

  getNotificationId(notification: Notification): number | undefined {
    return notification.notificationId || notification.id;
  }

  isSelected(notification: Notification): boolean {
    const id = this.getNotificationId(notification);
    return !!id && this.selectedIds.has(id);
  }

  toggleSelection(notification: Notification, checked: boolean): void {
    const id = this.getNotificationId(notification);
    if (!id) return;
    if (checked) {
      this.selectedIds.add(id);
    } else {
      this.selectedIds.delete(id);
    }
  }

  toggleSelectAll(checked: boolean): void {
    this.notifications.forEach(notification => {
      const id = this.getNotificationId(notification);
      if (!id) return;
      if (checked) {
        this.selectedIds.add(id);
      } else {
        this.selectedIds.delete(id);
      }
    });
  }

  areAllVisibleSelected(): boolean {
    const visibleIds = this.notifications
      .map(notification => this.getNotificationId(notification))
      .filter((id): id is number => !!id);
    return visibleIds.length > 0 && visibleIds.every(id => this.selectedIds.has(id));
  }

  isSomeVisibleSelected(): boolean {
    const visibleIds = this.notifications
      .map(notification => this.getNotificationId(notification))
      .filter((id): id is number => !!id);
    return visibleIds.some(id => this.selectedIds.has(id)) && !this.areAllVisibleSelected();
  }

  bulkDeleteSelected(): void {
    const ids = Array.from(this.selectedIds);
    if (ids.length === 0) return;

    Swal.fire({
      title: 'Delete Selected?',
      text: 'Are you sure you want to delete selected notifications?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc3545'
    }).then(result => {
      if (result.isConfirmed) {
        this.notificationService.bulkDelete(ids).subscribe({
          next: (response) => {
            this.selectedIds.clear();
            Swal.fire('Deleted', `${response.deletedCount || ids.length} notification(s) deleted.`, 'success');
            this.notificationService.notifyNotificationsChanged();
            this.loadNotifications();
          },
          error: (error) => {
            const message = error?.error?.message || 'Bulk delete failed';
            Swal.fire('Error', message, 'error');
          }
        });
      }
    });
  }

  deleteNotification(id: number): void {
    Swal.fire({
      title: 'Delete Notification?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.notificationService.deleteNotification(id).subscribe({
          next: () => {
            this.selectedIds.delete(id);
            this.notificationService.notifyNotificationsChanged();
            this.loadNotifications();
          },
          error: () => Swal.fire('Error', 'Delete failed', 'error')
        });
      }
    });
  }

  clearAllNotifications(): void {
    Swal.fire({
      title: 'Clear All Notifications?',
      text: 'This will delete all existing notifications. This action cannot be undone. Continue?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Clear All',
      confirmButtonColor: '#dc3545'
    }).then(result => {
      if (result.isConfirmed) {
        this.notificationService.clearAllNotifications().subscribe({
          next: (response) => {
            this.selectedIds.clear();
            this.notificationService.notifyNotificationsChanged();
            Swal.fire('Cleared', `${response.deletedCount || 0} notification(s) deleted.`, 'success');
            this.currentPage = 1;
            this.loadNotifications();
          },
          error: (error) => {
            const message = error?.error?.message || 'Could not clear notifications';
            Swal.fire('Error', message, 'error');
          }
        });
      }
    });
  }

  getTypeBadgeClass(type: string): string {
    switch(type) {
      case 'LOW_STOCK': return 'bg-warning';
      case 'DUE_PAYMENT':
      case 'PAYMENT': return 'bg-danger';
      case 'SALE': return 'bg-success';
      case 'PURCHASE': return 'bg-primary';
      case 'PURCHASE_RETURN': return 'bg-warning';
      case 'WASTAGE': return 'bg-danger';
      case 'SYSTEM': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  formatDate(date: any): string {
    return date ? new Date(date).toLocaleString() : '-';
  }

  firstPage(): void { if (this.currentPage !== 1) { this.currentPage = 1; this.loadNotifications(); } }
  previousPage(): void { if (this.currentPage > 1) { this.currentPage--; this.loadNotifications(); } }
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadNotifications(); } }
  lastPage(): void { if (this.currentPage !== this.totalPages) { this.currentPage = this.totalPages; this.loadNotifications(); } }
}
