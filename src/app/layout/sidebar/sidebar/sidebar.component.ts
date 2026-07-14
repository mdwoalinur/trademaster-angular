
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { MenuService, MenuItem } from 'src/app/services/menu.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {

  // Search term bound to input
  searchTerm = '';
  
  // Track selected index for keyboard navigation
  selectedIndex = -1;
  
  // Flat list of currently visible leaf items (for keyboard nav)
  visibleItems: MenuItem[] = [];
  
  // Router subscription (optional, for mobile sidebar auto-close)
  private routerSub!: Subscription;
  private languageSub!: Subscription;
  
  // Complete menu structure fetched from service
  menuSections: { title: string; titleKey?: string; items: MenuItem[] }[] = [];
  currentUrl = '';

  constructor(
    private router: Router,
    private menuService: MenuService,
    private translate: TranslateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUrl = this.cleanUrl(this.router.url);

    // Fetch menu configuration from centralized service
    this.menuSections = this.menuService.getMenuSections();
    
    // Initialize visibility and expanded state for all items
    this.initializeMenuState(this.menuSections);
    
    // Apply initial filter (shows all)
    this.filterMenu();
    this.syncExpandedWithRoute(this.currentUrl);
    
    // Optional: Close mobile sidebar on route change
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const nav = event as NavigationEnd;
      this.currentUrl = this.cleanUrl(nav.urlAfterRedirects || nav.url);
      if (!this.searchTerm.trim()) {
        this.filterMenu();
      } else {
        this.syncExpandedWithRoute(this.currentUrl);
      }
      this.closeMobileSidebar();
    });

    this.languageSub = this.translate.onLangChange.subscribe(() => this.filterMenu());
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
    if (this.languageSub) {
      this.languageSub.unsubscribe();
    }
  }

  /**
   * Recursively initialize visible, expanded, and matched properties
   */
  private initializeMenuState(sections: any[]): void {
    for (const section of sections) {
      for (const item of section.items) {
        item.visible = this.canAccess(item);
        item.matched = false;
        if (item.children) {
          item.expanded = false;
          this.initializeMenuState([{ items: item.children }]);
        }
      }
    }
  }

  /**
   * Filter menu based on search term (case-insensitive)
   */
  filterMenu(): void {
    const term = this.normalizeSearchText(this.searchTerm);
    
    // Reset all items: not matched, not visible
    const resetItem = (item: MenuItem) => {
      item.matched = false;
      item.visible = false;
      if (item.children) {
        item.children.forEach(child => resetItem(child));
      }
    };
    this.menuSections.forEach(section => {
      section.items.forEach(item => resetItem(item));
    });

    if (!term) {
      // No search term: show accessible items, collapse dropdowns
      this.menuSections.forEach(section => {
        section.items.forEach(item => this.restoreItemVisibility(item));
      });
      this.syncExpandedWithRoute(this.currentUrl);
      this.updateVisibleItemsList();
      return;
    }

    // Process each item to determine visibility and matching
    const processItem = (item: MenuItem, inheritedMatch = false): boolean => {
      if (!this.canAccess(item)) {
        item.visible = false;
        return false;
      }

      let hasVisibleChild = false;
      const itemMatch = this.itemMatchesSearch(item, term);
      item.matched = itemMatch;
      const shouldShowChildren = inheritedMatch || itemMatch;
      
      if (item.children) {
        for (const child of item.children) {
          const childVisible = processItem(child, shouldShowChildren);
          hasVisibleChild = hasVisibleChild || childVisible;
        }
        item.visible = hasVisibleChild || itemMatch || inheritedMatch;
        item.expanded = item.visible && (hasVisibleChild || itemMatch || inheritedMatch);
      } else {
        item.visible = inheritedMatch || itemMatch;
      }
      
      return item.visible || false;
    };

    this.menuSections.forEach(section => {
      const sectionMatch = this.sectionMatchesSearch(section, term);
      section.items.forEach(item => processItem(item, sectionMatch));
    });
    
    this.updateVisibleItemsList();
  }

  private restoreItemVisibility(item: MenuItem): boolean {
    if (!this.canAccess(item)) {
      item.visible = false;
      item.expanded = false;
      return false;
    }

    item.matched = false;
    if (item.children?.length) {
      const hasVisibleChild = item.children
        .map(child => this.restoreItemVisibility(child))
        .some(Boolean);
      item.visible = hasVisibleChild;
      item.expanded = false;
      return item.visible;
    }

    item.visible = true;
    return true;
  }

  /**
   * Build a flat list of currently visible leaf items (for keyboard navigation)
   */
  private updateVisibleItemsList(): void {
    this.visibleItems = [];
    const traverse = (items: MenuItem[]) => {
      for (const item of items) {
        if (item.visible) {
          if (!item.children || item.children.length === 0) {
            this.visibleItems.push(item);
          } else if (item.children) {
            traverse(item.children);
          }
        }
      }
    };
    this.menuSections.forEach(section => traverse(section.items));
    
    // Reset selected index if out of bounds
    if (this.selectedIndex >= this.visibleItems.length) {
      this.selectedIndex = this.visibleItems.length > 0 ? 0 : -1;
    }
  }

  private syncExpandedWithRoute(url: string): void {
    const syncItem = (item: MenuItem): boolean => {
      const activeSelf = this.routeMatches(item.route, url);
      const activeChild = item.children ? item.children.some(child => syncItem(child)) : false;

      if (item.children) {
        if (activeChild || activeSelf) {
          item.expanded = true;
        } else if (!this.searchTerm.trim()) {
          item.expanded = false;
        }
      }

      return activeSelf || activeChild;
    };

    this.menuSections.forEach(section => section.items.forEach(item => syncItem(item)));
  }

  isRouteActive(item: MenuItem): boolean {
    return this.routeMatches(item.route, this.currentUrl) || this.hasActiveChild(item);
  }

  hasActiveChild(item: MenuItem): boolean {
    return !!item.children?.some(child => this.isRouteActive(child));
  }

  private routeMatches(route: string | undefined, url: string): boolean {
    if (!route) return false;
    const current = this.cleanUrl(url);

    if (route === '/expenses') {
      return current === '/expenses' || current.startsWith('/expenses/edit') || current.startsWith('/expenses/view');
    }

    if (route === '/payments') {
      return current === '/payments' || current.startsWith('/payments/add') || current.startsWith('/payments/edit') || current.startsWith('/payments/view');
    }

    return current === route || current.startsWith(`${route}/`);
  }

  private cleanUrl(url: string): string {
    return (url || '').split('?')[0].split('#')[0];
  }

  /**
   * Toggle dropdown manually (for click)
   */
  toggleDropdown(item: MenuItem, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  /**
   * Check if a section has any visible items
   */
  sectionHasVisibleItems(section: any): boolean {
    return section.items.some((item: MenuItem) => item.visible);
  }

  /**
   * Highlight matching text within label
   */
  highlightMatch(label: string): string {
    if (!this.searchTerm.trim()) return label;
    const term = this.searchTerm.trim();
    // Escape special regex characters
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    return label.replace(regex, '<mark>$1</mark>');
  }

  getMenuLabel(item: MenuItem): string {
    return item.labelKey ? this.translate.instant(item.labelKey) : item.label;
  }

  private itemMatchesSearch(item: MenuItem, term: string): boolean {
    const values = [
      item.label,
      this.getMenuLabel(item),
      item.route || '',
      ...(item.searchTerms || [])
    ];

    return values.some(value => this.normalizeSearchText(value).includes(term));
  }

  private sectionMatchesSearch(section: { title: string; titleKey?: string }, term: string): boolean {
    const values = [
      section.title,
      section.titleKey ? this.translate.instant(section.titleKey) : ''
    ];

    return !!term && values.some(value => this.normalizeSearchText(value).includes(term));
  }

  private normalizeSearchText(value: string | undefined): string {
    return (value || '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  private canAccess(item: MenuItem): boolean {
    const profile = this.authService.getCachedProfile();
    const roleName = this.normalizeAuthority(profile?.roleName || '');
    const authorities = this.extractAuthorities();
    const hasPermissionClaims = Array.from(authorities).some(authority => this.looksLikePermission(authority));

    if (item.roles?.length) {
      const allowedRoles = item.roles.map(role => this.normalizeAuthority(role));
      if (!allowedRoles.includes(roleName) && !allowedRoles.some(role => authorities.has(role))) {
        return false;
      }
    }

    if (!item.permissions?.length || !hasPermissionClaims) {
      return true;
    }

    return item.permissions.some(permission => authorities.has(this.normalizeAuthority(permission)));
  }

  private extractAuthorities(): Set<string> {
    const token = this.authService.getToken();
    if (!token) return new Set();

    try {
      const claims = JSON.parse(atob(token.split('.')[1] || '')) as Record<string, unknown>;
      const values: string[] = [];
      const append = (value: unknown): void => {
        if (!value) return;
        if (Array.isArray(value)) {
          value.forEach(append);
        } else if (typeof value === 'string') {
          value.split(/[,\s]+/).filter(Boolean).forEach(part => values.push(part));
        } else if (typeof value === 'object') {
          const objectValue = value as Record<string, unknown>;
          append(objectValue['authority'] || objectValue['name'] || objectValue['roleName']);
        }
      };

      append(claims['authorities']);
      append(claims['permissions']);
      append(claims['roles']);
      append(claims['scope']);
      append(claims['role']);
      append(claims['roleName']);

      return new Set(values.map(value => this.normalizeAuthority(value)));
    } catch {
      return new Set();
    }
  }

  private normalizeAuthority(value: string): string {
    return value.trim().toUpperCase().replace(/^ROLE_/, '');
  }

  private looksLikePermission(value: string): boolean {
    const knownRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALESMAN', 'EMPLOYEE', 'USER'];
    return value.includes('_') && !knownRoles.includes(value);
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.filterMenu();
    this.selectedIndex = -1;
  }

  /**
   * Navigate to route and optionally clear search
   */
  navigateTo(route: string | undefined): void {
    if (route) {
      this.router.navigate([route]);
      this.closeMobileSidebar();
    }
  }

  private closeMobileSidebar(): void {
    if (window.innerWidth <= 900) {
      document.body.classList.remove('mobile-sidebar-open');
    }
  }

  // ==================== Keyboard Navigation ====================
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const activeElement = document.activeElement;
    const isSearchFocused = activeElement?.id === 'sidebar-search';
    
    if (isSearchFocused) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.focusNextItem();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.focusPreviousItem();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        this.selectCurrentItem();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.clearSearch();
      }
    }
  }

  focusNextItem(): void {
    if (this.visibleItems.length === 0) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.visibleItems.length;
    this.scrollToSelected();
  }

  focusPreviousItem(): void {
    if (this.visibleItems.length === 0) return;
    this.selectedIndex = (this.selectedIndex - 1 + this.visibleItems.length) % this.visibleItems.length;
    this.scrollToSelected();
  }

  selectCurrentItem(): void {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.visibleItems.length) {
      const item = this.visibleItems[this.selectedIndex];
      this.navigateTo(item.route);
    }
  }

  scrollToSelected(): void {
    setTimeout(() => {
      const selectedElement = document.querySelector('.menu-item[data-selected="true"]');
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 50);
  }

  isSelected(item: MenuItem): boolean {
    const index = this.visibleItems.indexOf(item);
    return index === this.selectedIndex;
  }
}
