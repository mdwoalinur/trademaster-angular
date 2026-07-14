import { Component, HostListener, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnDestroy {
  closeMobileSidebar(): void {
    document.body.classList.remove('mobile-sidebar-open');
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 900) this.closeMobileSidebar();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobileSidebar();
  }

  ngOnDestroy(): void {
    this.closeMobileSidebar();
  }
}
