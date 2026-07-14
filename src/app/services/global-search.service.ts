import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';

export interface GlobalSearchItem {
  type: string;
  module: string;
  id: number;
  title: string;
  subtitle: string;
  route: string;
  icon: string;
  status?: string;
  photoUrl?: string;
  customerCode?: string;
  supplierCode?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
}

export interface GlobalSearchResponse {
  products: GlobalSearchItem[];
  customers: GlobalSearchItem[];
  suppliers: GlobalSearchItem[];
  sales: GlobalSearchItem[];
  purchases: GlobalSearchItem[];
  warehouses: GlobalSearchItem[];
  inventory?: GlobalSearchItem[];
  finance?: GlobalSearchItem[];
  system?: GlobalSearchItem[];
}

export interface GlobalSearchGroup {
  module: string;
  items: GlobalSearchItem[];
}

interface GlobalSearchRouteItem {
  module: string;
  title: string;
  subtitle: string;
  route: string;
  icon: string;
  aliases: string[];
  permissions?: string[];
  roles?: string[];
}

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private apiUrl = `${environment.apiUrl}/global-search`;
  private legacyApiUrl = `${environment.apiUrl}/search/global`;
  private readonly routeRegistry: GlobalSearchRouteItem[] = [
    this.route('Dashboard', 'Dashboard overview and analytics', '/dashboard', 'bi-speedometer2', 'Dashboard', ['home', 'overview', 'analytics']),

    this.route('Product Management', 'All Products', '/products', 'bi-box', 'Products', ['product list', 'stock items', 'items'], ['PRODUCT_VIEW']),
    this.route('Product Management', 'Add Product', '/products/add', 'bi-plus-circle', 'Products', ['new product', 'create product'], ['PRODUCT_CREATE']),
    this.route('Product Management', 'Variations', '/products/variations', 'bi-grid', 'Products', ['product variation', 'variants'], ['PRODUCT_VIEW']),
    this.route('Product Management', 'Add Variation', '/products/variations/add', 'bi-plus-circle', 'Products', ['new variation', 'create variation'], ['PRODUCT_CREATE']),
    this.route('Product Management', 'Categories', '/products/categories', 'bi-tags', 'Products', ['product categories', 'category list'], ['CATEGORY_VIEW']),
    this.route('Product Management', 'Add Category', '/products/categories/add', 'bi-plus-circle', 'Products', ['new category', 'create category'], ['CATEGORY_CREATE']),
    this.route('Product Management', 'Units', '/units', 'bi-rulers', 'Products', ['unit list', 'measurement units'], ['UNIT_VIEW']),
    this.route('Product Management', 'Add Unit', '/units/add', 'bi-plus-circle', 'Products', ['new unit', 'create unit'], ['UNIT_CREATE']),

    this.route('People', 'Customers', '/customers', 'bi-people', 'People', ['customer list', 'clients'], ['CUSTOMER_VIEW']),
    this.route('People', 'Add Customer', '/customers/add', 'bi-person-plus', 'People', ['new customer', 'create customer'], ['CUSTOMER_CREATE']),
    this.route('People', 'Suppliers', '/suppliers', 'bi-building', 'People', ['supplier list', 'vendors'], ['SUPPLIER_VIEW']),
    this.route('People', 'Add Supplier', '/suppliers/add', 'bi-plus-circle', 'People', ['new supplier', 'new vendor'], ['SUPPLIER_CREATE']),

    this.route('Warehouse', 'Warehouses', '/warehouses', 'bi-building', 'Warehouse', ['warehouse list', 'branches'], ['WAREHOUSE_VIEW']),
    this.route('Warehouse', 'Add Warehouse', '/warehouses/add', 'bi-plus-circle', 'Warehouse', ['new warehouse', 'create warehouse'], ['WAREHOUSE_CREATE']),

    this.route('Purchases', 'All Purchases', '/purchases', 'bi-truck', 'Purchases', ['purchase list', 'purchase orders', 'po'], ['PURCHASE_VIEW']),
    this.route('Purchases', 'Add Purchase', '/purchases/add', 'bi-plus-circle', 'Purchases', ['new purchase', 'create purchase', 'purchase order'], ['PURCHASE_CREATE']),
    this.route('Purchases', 'Purchase Returns', '/purchase-returns', 'bi-arrow-counterclockwise', 'Purchases', ['purchase return list', 'return to supplier'], ['PURCHASE_RETURN_VIEW']),
    this.route('Purchases', 'Add Purchase Return', '/purchase-returns/add', 'bi-plus-circle', 'Purchases', ['new purchase return'], ['PURCHASE_RETURN_CREATE']),

    this.route('Sales', 'All Sales', '/sales', 'bi-receipt', 'Sales', ['sales list', 'sale invoices', 'invoices'], ['SALE_VIEW']),
    this.route('Sales', 'Add Sale', '/sales/add', 'bi-plus-circle', 'Sales', ['new sale', 'create sale', 'invoice'], ['SALE_CREATE']),
    this.route('Sales', 'Sale Items', '/sales/items', 'bi-list-ul', 'Sales', ['sales items', 'invoice items'], ['SALE_VIEW']),
    this.route('Sales', 'Add Sale Item', '/sales/items/add', 'bi-plus-circle', 'Sales', ['new sale item'], ['SALE_CREATE']),
    this.route('Sales', 'Point of Sale', '/sales/pos', 'bi-cart', 'Sales', ['pos', 'checkout', 'billing', 'cash counter'], ['SALE_CREATE']),
    this.route('Sales', 'Sales Returns', '/sales-returns', 'bi-arrow-return-left', 'Sales', ['sale returns', 'customer returns'], ['SALE_RETURN_VIEW']),

    this.route('Finance', 'All Payments', '/payments', 'bi-cash-stack', 'Finance', ['payments list', 'central payments'], ['PAYMENT_VIEW']),
    this.route('Finance', 'Add Payment', '/payments/add', 'bi-plus-circle', 'Finance', ['new payment', 'create payment'], ['PAYMENT_CREATE']),
    this.route('Finance', 'Payment Dashboard', '/payments/dashboard', 'bi-speedometer2', 'Finance', ['payment overview', 'payment summary'], ['PAYMENT_VIEW']),
    this.route('Finance', 'Pending Approvals', '/payments/pending-approvals', 'bi-shield-check', 'Finance', ['payment approvals', 'approve payment', 'pending payments'], ['PAYMENT_APPROVE']),
    this.route('Finance', 'Financial Accounts', '/payments/accounts', 'bi-bank', 'Finance', ['bank accounts', 'cash accounts', 'accounts'], ['PAYMENT_VIEW']),
    this.route('Finance', 'Add Financial Account', '/payments/accounts/add', 'bi-plus-circle', 'Finance', ['new account', 'create financial account'], ['PAYMENT_CREATE']),
    this.route('Finance', 'Bank Reconciliation', '/payments/reconciliation', 'bi-check2-square', 'Finance', ['reconcile', 'statement entries', 'bank match'], ['PAYMENT_RECONCILE']),
    this.route('Finance', 'Payment Reports', '/payments/reports', 'bi-file-earmark-bar-graph', 'Finance', ['payment report', 'payment analytics'], ['PAYMENT_VIEW']),

    this.route('Expenses', 'All Expenses', '/expenses', 'bi-receipt-cutoff', 'Expenses', ['expense list', 'business expenses'], ['EXPENSE_VIEW']),
    this.route('Expenses', 'Add Expense', '/expenses/add', 'bi-plus-circle', 'Expenses', ['new expense', 'create expense'], ['EXPENSE_CREATE']),
    this.route('Expenses', 'Expense Categories', '/expenses/categories', 'bi-tags', 'Expenses', ['expense category list'], ['EXPENSE_VIEW']),
    this.route('Expenses', 'Add Expense Category', '/expenses/categories/add', 'bi-plus-circle', 'Expenses', ['new expense category'], ['EXPENSE_CREATE']),

    this.route('Wastage', 'Wastage Categories', '/inventory/wastage/categories', 'bi-tags', 'Wastage', ['damage categories', 'waste categories'], ['WASTAGE_VIEW']),
    this.route('Wastage', 'Add Wastage Category', '/inventory/wastage/categories/add', 'bi-plus-circle', 'Wastage', ['new wastage category'], ['WASTAGE_CREATE']),
    this.route('Wastage', 'Wastage Records', '/inventory/wastage/records', 'bi-trash3', 'Wastage', ['waste records', 'damaged stock'], ['WASTAGE_VIEW']),
    this.route('Wastage', 'Add Wastage Record', '/inventory/wastage/records/add', 'bi-plus-circle', 'Wastage', ['new wastage record'], ['WASTAGE_CREATE']),

    this.route('Inventory', 'Stock Overview', '/inventory', 'bi-archive', 'Inventory', ['inventory overview', 'stock'], ['INVENTORY_VIEW']),
    this.route('Inventory', 'Stock Movements', '/inventory/movements', 'bi-arrow-left-right', 'Inventory', ['movement history', 'stock in out'], ['INVENTORY_VIEW']),
    this.route('Inventory', 'Stock Transfers', '/stock-transfers', 'bi-arrow-left-right', 'Inventory', ['transfer stock', 'warehouse transfer'], ['STOCK_TRANSFER_VIEW']),
    this.route('Inventory', 'Add Stock Transfer', '/stock-transfers/add', 'bi-plus-circle', 'Inventory', ['new stock transfer'], ['STOCK_TRANSFER_CREATE']),
    this.route('Inventory', 'Adjustments', '/inventory/adjustments', 'bi-sliders2', 'Inventory', ['stock adjustment', 'inventory adjustment'], ['INVENTORY_ADJUST']),
    this.route('Inventory', 'Low Stock Alerts', '/inventory/low-stock', 'bi-bell', 'Inventory', ['reorder alerts', 'low stock'], ['INVENTORY_VIEW']),

    this.route('Reports', 'Sales Report', '/reports/sales', 'bi-graph-up', 'Reports', ['sales analytics', 'sale report'], ['REPORT_VIEW']),
    this.route('Reports', 'Purchase Report', '/reports/purchases', 'bi-cart-check', 'Reports', ['purchase analytics', 'purchases report'], ['REPORT_VIEW']),
    this.route('Reports', 'Inventory Report', '/reports/inventory', 'bi-pie-chart', 'Reports', ['stock report', 'inventory analytics'], ['REPORT_VIEW']),
    this.route('Reports', 'Profit & Loss', '/reports/profit-loss', 'bi-cash-stack', 'Reports', ['profit loss', 'p&l', 'income statement'], ['REPORT_VIEW']),
    this.route('Reports', 'Tax Report', '/reports/tax', 'bi-file-earmark-text', 'Reports', ['vat report', 'gst report', 'tax compliance'], ['REPORT_VIEW']),
    this.route('Reports', 'Notifications History', '/notifications', 'bi-bell', 'Reports', ['notification list', 'alerts history'], ['NOTIFICATION_VIEW']),

    this.route('System', 'Users', '/users', 'bi-person-badge', 'System', ['user management', 'staff'], ['USER_VIEW'], ['SUPER_ADMIN', 'ADMIN']),
    this.route('System', 'Add User', '/users/add', 'bi-person-plus', 'System', ['new user', 'create user'], ['USER_CREATE'], ['SUPER_ADMIN', 'ADMIN']),
    this.route('System', 'Roles', '/roles', 'bi-shield-lock', 'System', ['role management', 'permissions'], ['ROLE_VIEW'], ['SUPER_ADMIN', 'ADMIN']),
    this.route('System', 'Add Role', '/roles/add', 'bi-plus-circle', 'System', ['new role', 'create role'], ['ROLE_CREATE'], ['SUPER_ADMIN', 'ADMIN']),
    this.route('System', 'Settings', '/settings', 'bi-gear', 'System', ['system settings', 'preferences'], ['SETTING_VIEW'], ['SUPER_ADMIN', 'ADMIN']),
    this.route('System', 'Audit Logs', '/audit-logs', 'bi-journal-text', 'System', ['audit log', 'activity logs'], ['AUDIT_LOG_VIEW'], ['SUPER_ADMIN', 'ADMIN']),
    this.route('System', 'My Profile', '/profile', 'bi-person-circle', 'System', ['profile', 'account profile']),
    this.route('System', 'Change Password', '/change-password', 'bi-key', 'System', ['password', 'security'])
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  search(query: string, limit = 50): Observable<GlobalSearchItem[]> {
    const localResults = this.searchRoutes(query, limit);
    const params = new HttpParams()
      .set('query', query)
      .set('limit', String(limit));
    return this.http.get<GlobalSearchItem[] | GlobalSearchResponse>(this.apiUrl, { params }).pipe(
      map(response => this.mergeResults(localResults, Array.isArray(response) ? response : this.flatten(response), limit)),
      catchError(() => of(localResults))
    );
  }

  legacySearch(keyword: string): Observable<GlobalSearchResponse> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<GlobalSearchResponse>(this.legacyApiUrl, { params });
  }

  flatten(response: Partial<GlobalSearchResponse> | null | undefined): GlobalSearchItem[] {
    if (!response) return [];
    return [
      ...(response.products || []),
      ...(response.customers || []),
      ...(response.suppliers || []),
      ...(response.sales || []),
      ...(response.purchases || []),
      ...(response.warehouses || []),
      ...(response.inventory || []),
      ...(response.finance || []),
      ...(response.system || [])
    ];
  }

  groupByModule(items: GlobalSearchItem[]): GlobalSearchGroup[] {
    const map = new Map<string, GlobalSearchItem[]>();
    items.forEach(item => {
      const moduleName = item.module || item.type || 'Other';
      if (!map.has(moduleName)) map.set(moduleName, []);
      map.get(moduleName)!.push(item);
    });
    return Array.from(map.entries()).map(([module, groupedItems]) => ({ module, items: groupedItems }));
  }

  searchRoutes(query: string, limit = 50): GlobalSearchItem[] {
    const term = this.normalize(query);
    if (term.length < 2) return [];

    return this.routeRegistry
      .filter(item => this.canAccess(item))
      .map((item, index) => ({ item, index, score: this.scoreRoute(item, term) }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, limit)
      .map((result, index) => ({
        type: 'PAGE',
        module: result.item.module,
        id: -(index + 1),
        title: result.item.title,
        subtitle: result.item.subtitle,
        route: result.item.route,
        icon: result.item.icon,
        status: 'Page'
      }));
  }

  private route(
    module: string,
    title: string,
    route: string,
    icon: string,
    subtitle: string,
    aliases: string[],
    permissions?: string[],
    roles?: string[]
  ): GlobalSearchRouteItem {
    return { module, title, route, icon, subtitle, aliases, permissions, roles };
  }

  private scoreRoute(item: GlobalSearchRouteItem, term: string): number {
    const title = this.normalize(item.title);
    const module = this.normalize(item.module);
    const subtitle = this.normalize(item.subtitle);
    const route = this.normalize(item.route.replace(/\//g, ' '));
    const aliases = item.aliases.map(alias => this.normalize(alias));

    if (title === term || aliases.some(alias => alias === term)) return 100;
    if (title.startsWith(term)) return 90;
    if (aliases.some(alias => alias.startsWith(term))) return 80;
    if (title.includes(term)) return 70;
    if (aliases.some(alias => alias.includes(term))) return 60;
    if (module.includes(term)) return 45;
    if (subtitle.includes(term)) return 35;
    if (route.includes(term)) return 25;
    return 0;
  }

  private mergeResults(localResults: GlobalSearchItem[], remoteResults: GlobalSearchItem[], limit: number): GlobalSearchItem[] {
    const seen = new Set<string>();
    const merged: GlobalSearchItem[] = [];

    [...localResults, ...(remoteResults || [])].forEach(item => {
      const key = `${item.type || ''}|${item.id || ''}|${item.route || ''}|${this.normalize(item.title || '')}`;
      if (!item.route || seen.has(key)) return;
      seen.add(key);
      merged.push(item);
    });

    return merged.slice(0, limit);
  }

  private canAccess(item: GlobalSearchRouteItem): boolean {
    const profile = this.authService.getCachedProfile();
    const roleName = this.normalizeAuthority(profile?.roleName || '');
    const tokenClaims = this.getTokenClaims();
    const authorities = this.extractAuthorities(tokenClaims);
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

  private getTokenClaims(): Record<string, unknown> {
    const token = this.authService.getToken();
    if (!token) return {};
    try {
      return JSON.parse(atob(token.split('.')[1] || ''));
    } catch {
      return {};
    }
  }

  private extractAuthorities(claims: Record<string, unknown>): Set<string> {
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
  }

  private normalizeAuthority(value: string): string {
    return value.trim().toUpperCase().replace(/^ROLE_/, '');
  }

  private looksLikePermission(value: string): boolean {
    const knownRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALESMAN', 'EMPLOYEE', 'USER'];
    return value.includes('_') && !knownRoles.includes(value);
  }

  private normalize(value: string): string {
    return (value || '').toLowerCase().trim();
  }
}
