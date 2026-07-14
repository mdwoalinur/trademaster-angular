import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { Subscription, interval, of, Subject } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { Notification } from 'src/app/models/notification.model';
import { AuthService, CurrentUserProfile } from 'src/app/core/services/auth.service';
import { AppLanguage, LanguageService } from 'src/app/core/services/language.service';
import { AppTheme, ThemeService } from 'src/app/core/services/theme.service';
import { ProfileService } from 'src/app/services/profile.service';
import { GlobalSearchGroup, GlobalSearchItem, GlobalSearchService } from 'src/app/services/global-search.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
    @ViewChild('globalSearchInput') globalSearchInput?: ElementRef<HTMLInputElement>;

    currentUser = 'User';
    userRole = 'User';
    userInitials = 'U';
    userProfileImage = '';
    userLastLogin = '';
    userIsActive = true;
    searchTerm = '';
    searchResults: GlobalSearchItem[] = [];
    searchGroups: GlobalSearchGroup[] = [];
    searchOpen = false;
    searchDropdownOpen = false;
    searchLoading = false;
    searchError = '';
    selectedSearchIndex = -1;
    private searchInput$ = new Subject<string>();
    private searchSubscription?: Subscription;
    userEmail = '';
    sidebarCollapsed = false;
    showMobileTools = false;
    appZoom = 1;
    readonly minZoom = 0.8;
    readonly maxZoom = 1.25;
    readonly zoomStep = 0.05;
    private readonly zoomStorageKey = 'trademaster-app-zoom';
    selectedLanguage: AppLanguage = 'en';
    selectedTheme: AppTheme = 'light';

    // Notification properties
    notifications: Notification[] = [];
    unreadCount = 0;
    showDropdown = false;
    private pollingSubscription!: Subscription;
    private userSubscription?: Subscription;
    private notificationChangeSubscription?: Subscription;

    constructor(
        private router: Router,
        private notificationService: NotificationService,
        private authService: AuthService,
        private languageService: LanguageService,
        private themeService: ThemeService,
        private profileService: ProfileService,
        private globalSearchService: GlobalSearchService,
        private cdr: ChangeDetectorRef,
        private alert: SweetAlertService
    ) {}

    ngOnInit(): void {
        this.sidebarCollapsed = document.body.classList.contains('sidebar-collapsed');
        this.loadProjectZoom();
        this.selectedLanguage = this.languageService.getCurrentLanguage();
        this.selectedTheme = this.themeService.getCurrentTheme();
        this.userSubscription = this.authService.currentUser$.subscribe(profile => {
            if (profile) {
                this.applyProfile(profile);
                this.cdr.detectChanges();
            }
        });
        this.loadCurrentUser();
        this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
            this.syncSearchTermFromRoute();
            this.closeSearchDropdown();
        });

        this.searchSubscription = this.searchInput$
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(term => {
                    const q = term.trim();
                    this.searchError = '';
                    this.selectedSearchIndex = -1;
                    if (q.length < 2) {
                        this.searchLoading = false;
                        this.searchResults = [];
                        this.searchGroups = [];
                        this.searchDropdownOpen = false;
                        return of([]);
                    }
                    this.searchLoading = true;
                    this.searchDropdownOpen = true;
                    return this.globalSearchService.search(q, 50).pipe(
                        catchError(() => {
                            this.searchError = 'Search failed. Please try again.';
                            return of([]);
                        })
                    );
                })
            )
            .subscribe(results => {
                this.searchLoading = false;
                this.searchResults = results;
                this.searchGroups = this.globalSearchService.groupByModule(results);
                this.searchDropdownOpen = this.searchTerm.trim().length >= 2;
            });

        // Load notifications
        this.refreshNotifications();
        this.notificationChangeSubscription = this.notificationService.notificationsChanged$
            .subscribe(() => this.refreshNotifications());

        // Poll every 30 seconds
        this.pollingSubscription = interval(30000).subscribe(() => this.refreshNotifications());

        // close dropdown on any route change
    this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
            this.showDropdown = false;
        }
    });
    }

    syncSearchTermFromRoute(): void {
        if (this.router.url.startsWith('/search')) {
            const tree = this.router.parseUrl(this.router.url);
            this.searchTerm = (tree.queryParams['q'] || '').trim();
        }
    }

    ngOnDestroy(): void {
        if (this.pollingSubscription) this.pollingSubscription.unsubscribe();
        if (this.userSubscription) this.userSubscription.unsubscribe();
        if (this.notificationChangeSubscription) this.notificationChangeSubscription.unsubscribe();
        if (this.searchSubscription) this.searchSubscription.unsubscribe();
    }

    loadCachedProfile(): void {
        const cached = this.authService.getCachedProfile();
        if (cached) {
            this.applyProfile(cached);
        }
    }

    loadCurrentUser(): void {
        this.authService.refreshCurrentUser().subscribe({
            error: () => {
                this.authService.getCurrentUser().subscribe({
                    next: (profile) => {
                        this.authService.storeUserProfile(profile);
                    },
                    error: () => this.loadCachedProfile()
                });
            }
        });
    }

    applyProfile(profile: CurrentUserProfile): void {
        this.currentUser = profile.fullName || profile.username || 'User';
        this.userRole = profile.roleDisplayName || this.formatRole(profile.roleName || 'User');
        this.userEmail = profile.email || '';
        this.userInitials = this.buildInitials(this.currentUser);
        this.userProfileImage = this.profileService.resolveImageUrl(profile.profileImageUrl);
        this.userLastLogin = profile.lastLogin || '';
        this.userIsActive = profile.isActive !== false;
    }

    buildInitials(name: string): string {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join('') || 'U';
    }

    formatRole(roleName: string): string {
        const roleMap: Record<string, string> = {
            SUPER_ADMIN: 'Super Administrator',
            ADMIN: 'Administrator',
            MANAGER: 'Manager',
            SALESMAN: 'Sales Executive',
            EMPLOYEE: 'Employee'
        };
        if (roleMap[roleName]) {
            return roleMap[roleName];
        }
        return roleName
            .toLowerCase()
            .split('_')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }

    refreshNotifications(): void {
        this.notificationService.getUnreadCount().subscribe({
            next: cnt => this.unreadCount = cnt,
            error: () => this.unreadCount = 0
        });
        this.notificationService.getRecentNotifications(10).subscribe({
            next: data => this.notifications = data,
            error: () => this.notifications = []
        });
    }

    toggleDropdown(): void {
        this.showMobileTools = false;
        this.closeSearchDropdown();
        if (!this.searchTerm.trim()) this.searchOpen = false;
        this.showDropdown = !this.showDropdown;
        this.cdr.detectChanges();
        
        if (this.showDropdown) this.refreshNotifications();
    }

    markAsRead(notif: Notification): void {
        const id = notif.notificationId || notif.id;
        if (!id) return;
        this.notificationService.markAsRead(id).subscribe(() => {
            const route = notif.route || notif.actionUrl;
            this.refreshNotifications();
            this.showDropdown = false;
            if (route) this.router.navigateByUrl(route);
        });
    }

    markAllAsRead(): void {
        this.notificationService.markAllAsRead().subscribe(() => this.refreshNotifications());
    }

    toggleSidebar(): void {
        if (window.innerWidth <= 900) {
            document.body.classList.toggle('mobile-sidebar-open');
            return;
        }
        this.sidebarCollapsed = !this.sidebarCollapsed;
        document.body.classList.toggle('sidebar-collapsed', this.sidebarCollapsed);
    }

    toggleMobileTools(event: MouseEvent): void {
        event.stopPropagation();
        this.showDropdown = false;
        this.closeSearchDropdown();
        if (!this.searchTerm.trim()) this.searchOpen = false;
        this.showMobileTools = !this.showMobileTools;
    }

    openProfileMenu(): void {
        this.showMobileTools = false;
        this.showDropdown = false;
        this.closeSearchDropdown();
        if (!this.searchTerm.trim()) this.searchOpen = false;
    }

    @HostListener('document:keydown.escape')
    closeMobileHeaderOverlays(): void {
        this.showMobileTools = false;
        this.showDropdown = false;
        this.closeSearchDropdown();
        if (!this.searchTerm.trim()) this.searchOpen = false;
        this.globalSearchInput?.nativeElement?.blur();
    }

    loadProjectZoom(): void {
        const storedZoom = Number(localStorage.getItem(this.zoomStorageKey));
        if (!Number.isNaN(storedZoom) && storedZoom >= this.minZoom && storedZoom <= this.maxZoom) {
            this.appZoom = storedZoom;
        }
        this.applyProjectZoom();
    }

    zoomIn(): void {
        this.setProjectZoom(this.appZoom + this.zoomStep);
    }

    zoomOut(): void {
        this.setProjectZoom(this.appZoom - this.zoomStep);
    }

    resetZoom(): void {
        this.setProjectZoom(1);
    }

    switchLanguage(lang: AppLanguage): void {
        this.languageService.switchLanguage(lang);
        this.selectedLanguage = lang;
    }

    switchTheme(theme: AppTheme): void {
        this.themeService.switchTheme(theme);
        this.selectedTheme = theme;
    }

    setProjectZoom(value: number): void {
        const nextZoom = Math.min(this.maxZoom, Math.max(this.minZoom, value));
        this.appZoom = Number(nextZoom.toFixed(2));
        localStorage.setItem(this.zoomStorageKey, this.appZoom.toString());
        this.applyProjectZoom();
    }

    applyProjectZoom(): void {
        document.body.style.setProperty('zoom', this.appZoom.toString());
    }

    get zoomPercent(): number {
        return Math.round(this.appZoom * 100);
    }

    logout(): void {
        this.alert.logout().then(result => {
            if (!result.isConfirmed) return;
            this.authService.logout();
            this.router.navigate(['/login']);
        });
    }

    onSearch(): void {
        const q = this.searchTerm.trim();
        if (q) {
            this.closeSearchDropdown();
            this.router.navigate(['/search'], { queryParams: { q } });
        }
    }

    onSearchInput(): void {
        this.searchOpen = true;
        this.searchInput$.next(this.searchTerm);
    }

    onSearchFocus(): void {
        this.searchOpen = true;
        if (this.searchTerm.trim().length >= 2) {
            this.searchDropdownOpen = true;
            if (!this.searchResults.length && !this.searchLoading) {
                this.searchInput$.next(this.searchTerm);
            }
        }
    }

    openSearch(event?: Event): void {
        if (event) {
            const target = event.target as HTMLElement;
            if (target.tagName !== 'INPUT') {
                event.preventDefault();
            }
            event.stopPropagation();
        }
        this.showMobileTools = false;
        this.showDropdown = false;
        this.searchOpen = true;
        setTimeout(() => this.globalSearchInput?.nativeElement?.focus(), 0);
    }

    closeSearchDropdown(): void {
        this.searchDropdownOpen = false;
        this.selectedSearchIndex = -1;
    }

    openSearchResult(result: GlobalSearchItem): void {
        this.closeSearchDropdown();
        this.searchTerm = '';
        this.searchResults = [];
        this.searchGroups = [];
        this.router.navigateByUrl(result.route);
    }

    onSearchKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.closeSearchDropdown();
            if (!this.searchTerm.trim()) this.searchOpen = false;
            this.globalSearchInput?.nativeElement?.blur();
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            if (this.selectedSearchIndex >= 0 && this.searchResults[this.selectedSearchIndex]) {
                this.openSearchResult(this.searchResults[this.selectedSearchIndex]);
            } else {
                this.onSearch();
            }
            return;
        }

        if (!this.searchDropdownOpen || !this.searchResults.length) return;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.selectedSearchIndex = (this.selectedSearchIndex + 1) % this.searchResults.length;
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.selectedSearchIndex = this.selectedSearchIndex <= 0 ? this.searchResults.length - 1 : this.selectedSearchIndex - 1;
        }
    }

    isSelectedSearchResult(result: GlobalSearchItem): boolean {
        return this.selectedSearchIndex >= 0 && this.searchResults[this.selectedSearchIndex] === result;
    }

    hasSearchState(): boolean {
        return this.searchDropdownOpen && this.searchTerm.trim().length >= 2;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.global-search')) {
            this.closeSearchDropdown();
            if (!this.searchTerm.trim()) {
                this.searchOpen = false;
            }
        }
        if (!target.closest('.mobile-tools')) this.showMobileTools = false;
        if (!target.closest('.notification-dropdown')) this.showDropdown = false;
    }

    // Method to navigate and close dropdown
navigateToNotifications(): void {
    this.showDropdown = false;     
    this.router.navigate(['/notifications']);
}

}
