
import { Injectable } from '@angular/core';

export interface MenuItem {
  label: string;
  labelKey?: string;
  icon?: string;
  route?: string;
  roles?: string[];
  permissions?: string[];
  searchTerms?: string[];
  children?: MenuItem[];
  expanded?: boolean;       
  visible?: boolean;       
  matched?: boolean;       
}

@Injectable({ providedIn: 'root' })
export class MenuService {

  constructor() {
  
  }

  getMenuSections(): { title: string; titleKey?: string; items: MenuItem[] }[] {
    const allSections = [
      {
        title: 'MAIN',
        titleKey: 'MENU.SECTIONS.MAIN',
        items: [
          { label: 'Dashboard', labelKey: 'MENU.DASHBOARD', icon: 'bi bi-speedometer2', route: '/dashboard', searchTerms: ['home', 'overview', 'analytics'] }
        ]
      },
      {
        title: 'PRODUCT MANAGEMENT',
        titleKey: 'MENU.SECTIONS.PRODUCT_MANAGEMENT',
        items: [
          {
            label: 'Products', labelKey: 'MENU.PRODUCTS', icon: 'bi bi-box',
            children: [
              { label: 'All Products', labelKey: 'MENU.ALL_PRODUCTS', icon: 'bi bi-box', route: '/products', permissions: ['PRODUCT_VIEW'], searchTerms: ['product list', 'stock items', 'items'] },
              { label: 'Variations', labelKey: 'MENU.VARIATIONS', icon: 'bi bi-grid', route: '/products/variations', permissions: ['PRODUCT_VIEW'], searchTerms: ['variants', 'product variation'] },
              { label: 'Categories', labelKey: 'MENU.CATEGORIES', icon: 'bi bi-tags', route: '/products/categories', permissions: ['CATEGORY_VIEW'], searchTerms: ['product categories', 'category list'] },
              { label: 'Units', labelKey: 'MENU.UNITS', icon: 'bi bi-rulers', route: '/units', permissions: ['UNIT_VIEW'], searchTerms: ['measurement units', 'unit list'] }
            ]
          }
        ]
      },
      {
        title: 'PEOPLE',
        titleKey: 'MENU.SECTIONS.PEOPLE',
        items: [
          { label: 'Customers', labelKey: 'MENU.CUSTOMERS', icon: 'bi bi-people', route: '/customers', permissions: ['CUSTOMER_VIEW'], searchTerms: ['clients', 'customer list'] },
          { label: 'Suppliers', labelKey: 'MENU.SUPPLIERS', icon: 'bi bi-building', route: '/suppliers', permissions: ['SUPPLIER_VIEW'], searchTerms: ['vendors', 'supplier list'] }
        ]
      },
      {
        title: 'WAREHOUSE',
        titleKey: 'MENU.SECTIONS.WAREHOUSE',
        items: [
          { label: 'Warehouses', labelKey: 'MENU.WAREHOUSES', icon: 'bi bi-building', route: '/warehouses', permissions: ['WAREHOUSE_VIEW'], searchTerms: ['warehouse list', 'branches'] }
        ]
      },
      {
        title: 'PURCHASES',
        titleKey: 'MENU.SECTIONS.PURCHASES',
        items: [
          {
            label: 'Purchases', labelKey: 'MENU.PURCHASES', icon: 'bi bi-truck',
            children: [
              { label: 'All Purchases', labelKey: 'MENU.ALL_PURCHASES', icon: 'bi bi-list', route: '/purchases', permissions: ['PURCHASE_VIEW'], searchTerms: ['purchase list', 'purchase orders', 'po'] },
              { label: 'Add Purchase', labelKey: 'MENU.ADD_PURCHASE', icon: 'bi bi-plus-circle', route: '/purchases/add', permissions: ['PURCHASE_CREATE'], searchTerms: ['new purchase', 'create purchase', 'purchase order'] },
              { label: 'Purchase Returns', labelKey: 'MENU.PURCHASE_RETURNS', icon: 'bi bi-arrow-counterclockwise', route: '/purchase-returns', permissions: ['PURCHASE_RETURN_VIEW'], searchTerms: ['purchase return list', 'return to supplier'] }
            ]
          }
        ]
      },
      {
        title: 'SALES',
        titleKey: 'MENU.SECTIONS.SALES',
        items: [
          {
            label: 'Sales', labelKey: 'MENU.SALES', icon: 'bi bi-receipt',
            children: [
              { label: 'All Sales', labelKey: 'MENU.ALL_SALES', icon: 'bi bi-list', route: '/sales', permissions: ['SALE_VIEW'], searchTerms: ['sales list', 'sale invoices', 'invoices'] },
              { label: 'Add Sale', labelKey: 'MENU.ADD_SALE', icon: 'bi bi-plus-circle', route: '/sales/add', permissions: ['SALE_CREATE'], searchTerms: ['new sale', 'create sale', 'invoice'] },
              { label: 'Sale Items', labelKey: 'MENU.SALE_ITEMS', icon: 'bi bi-list-ul', route: '/sales/items', permissions: ['SALE_VIEW'], searchTerms: ['sales items', 'invoice items'] },
              { label: 'Point of Sale', labelKey: 'MENU.POINT_OF_SALE', icon: 'bi bi-cart', route: '/sales/pos', permissions: ['SALE_CREATE'], searchTerms: ['pos', 'checkout', 'billing', 'cash counter'] },
              { label: 'Sales Returns', labelKey: 'MENU.SALES_RETURNS', icon: 'bi bi-arrow-return-left', route: '/sales-returns', permissions: ['SALE_RETURN_VIEW'], searchTerms: ['sale returns', 'customer returns'] }
            ]
          }
        ]
      },
      {
        title: 'FINANCE',
        titleKey: 'MENU.SECTIONS.FINANCE',
        items: [
          {
            label: 'Payments', labelKey: 'MENU.PAYMENTS', icon: 'bi bi-cash-stack',
            children: [
              { label: 'All Payments', labelKey: 'MENU.PAYMENTS', icon: 'bi bi-list', route: '/payments', permissions: ['PAYMENT_VIEW'], searchTerms: ['payments list', 'central payments'] },
              { label: 'Payment Dashboard', labelKey: 'MENU.PAYMENT_DASHBOARD', icon: 'bi bi-speedometer2', route: '/payments/dashboard', permissions: ['PAYMENT_VIEW'], searchTerms: ['payment overview', 'payment summary'] },
              { label: 'Pending Approvals', labelKey: 'MENU.PENDING_APPROVALS', icon: 'bi bi-shield-check', route: '/payments/pending-approvals', permissions: ['PAYMENT_APPROVE'], searchTerms: ['payment approvals', 'approve payment', 'pending payments'] },
              { label: 'Financial Accounts', labelKey: 'MENU.FINANCIAL_ACCOUNTS', icon: 'bi bi-bank', route: '/payments/accounts', permissions: ['PAYMENT_VIEW'], searchTerms: ['bank accounts', 'cash accounts', 'accounts'] },
              { label: 'Bank Reconciliation', labelKey: 'MENU.BANK_RECONCILIATION', icon: 'bi bi-check2-square', route: '/payments/reconciliation', permissions: ['PAYMENT_RECONCILE'], searchTerms: ['reconcile', 'statement entries', 'bank match'] },
              { label: 'Payment Reports', labelKey: 'MENU.PAYMENT_REPORTS', icon: 'bi bi-file-earmark-bar-graph', route: '/payments/reports', permissions: ['PAYMENT_VIEW'], searchTerms: ['payment report', 'payment analytics'] }
            ]
          }
        ]
      },
      {
        title: 'EXPENSES',
        titleKey: 'MENU.SECTIONS.EXPENSES',
        items: [
          {
            label: 'Expenses', labelKey: 'MENU.EXPENSES', icon: 'bi bi-receipt-cutoff',
            children: [
              { label: 'All Expenses', labelKey: 'MENU.ALL_EXPENSES', icon: 'bi bi-list', route: '/expenses', permissions: ['EXPENSE_VIEW'], searchTerms: ['expense list', 'business expenses'] },
              { label: 'Add Expense', labelKey: 'MENU.ADD_EXPENSE', icon: 'bi bi-plus-circle', route: '/expenses/add', permissions: ['EXPENSE_CREATE'], searchTerms: ['new expense', 'create expense'] },
              { label: 'Expense Categories', labelKey: 'MENU.EXPENSE_CATEGORIES', icon: 'bi bi-tags', route: '/expenses/categories', permissions: ['EXPENSE_VIEW'], searchTerms: ['expense category list'] }
            ]
          }
        ]
      },
      {
        title: 'WASTAGE',
        titleKey: 'MENU.SECTIONS.WASTAGE',
        items: [
          {
            label: 'Wastage', labelKey: 'MENU.WASTAGE', icon: 'bi bi-trash3',
            children: [
              { label: 'Wastage Categories', labelKey: 'MENU.WASTAGE_CATEGORIES', icon: 'bi bi-tags', route: '/inventory/wastage/categories', permissions: ['WASTAGE_VIEW'], searchTerms: ['waste categories', 'damage categories'] },
              { label: 'Wastage Records', labelKey: 'MENU.WASTAGE_RECORDS', icon: 'bi bi-list', route: '/inventory/wastage/records', permissions: ['WASTAGE_VIEW'], searchTerms: ['waste records', 'damaged stock'] }
            ]
          }
        ]
      },
      {
        title: 'INVENTORY',
        titleKey: 'MENU.SECTIONS.INVENTORY',
        items: [
          {
            label: 'Inventory', labelKey: 'MENU.INVENTORY', icon: 'bi bi-archive',
            children: [
              { label: 'Stock Overview', labelKey: 'MENU.STOCK_OVERVIEW', icon: 'bi bi-eye', route: '/inventory', permissions: ['INVENTORY_VIEW'], searchTerms: ['inventory overview', 'stock'] },
              { label: 'Stock Movements', labelKey: 'MENU.STOCK_MOVEMENTS', icon: 'bi bi-arrow-left-right', route: '/inventory/movements', permissions: ['INVENTORY_VIEW'], searchTerms: ['movement history', 'stock in out'] },
              { label: 'Stock Transfers', labelKey: 'MENU.STOCK_TRANSFERS', icon: 'bi bi-arrow-left-right', route: '/stock-transfers', permissions: ['STOCK_TRANSFER_VIEW'], searchTerms: ['transfer stock', 'warehouse transfer'] },
              { label: 'Adjustments', labelKey: 'MENU.ADJUSTMENTS', icon: 'bi bi-sliders2', route: '/inventory/adjustments', permissions: ['INVENTORY_ADJUST'], searchTerms: ['stock adjustment', 'inventory adjustment'] },
              { label: 'Low Stock Alerts', labelKey: 'MENU.LOW_STOCK_ALERTS', icon: 'bi bi-bell', route: '/inventory/low-stock', permissions: ['INVENTORY_VIEW'], searchTerms: ['reorder alerts', 'low stock'] }
            ]
          }
        ]
      },
      {
        title: 'REPORTS',
        titleKey: 'MENU.SECTIONS.REPORTS',
        items: [
          { label: 'Sales Report', labelKey: 'MENU.SALES_REPORT', icon: 'bi bi-graph-up', route: '/reports/sales', permissions: ['REPORT_VIEW'], searchTerms: ['sales analytics', 'sale report'] },
          { label: 'Purchase Report', labelKey: 'MENU.PURCHASE_REPORT', icon: 'bi bi-cart-check', route: '/reports/purchases', permissions: ['REPORT_VIEW'], searchTerms: ['purchase analytics', 'purchases report'] },
          { label: 'Inventory Report', labelKey: 'MENU.INVENTORY_REPORT', icon: 'bi bi-pie-chart', route: '/reports/inventory', permissions: ['REPORT_VIEW'], searchTerms: ['stock report', 'inventory analytics'] },
          { label: 'Profit & Loss', labelKey: 'MENU.PROFIT_LOSS', icon: 'bi bi-cash-stack', route: '/reports/profit-loss', permissions: ['REPORT_VIEW'], searchTerms: ['profit loss', 'p&l', 'income statement'] },
          { label: 'Tax Report', labelKey: 'MENU.TAX_REPORT', icon: 'bi bi-file-earmark-text', route: '/reports/tax', permissions: ['REPORT_VIEW'], searchTerms: ['vat report', 'gst report', 'tax compliance'] },
          { label: 'Notifications History', labelKey: 'MENU.NOTIFICATIONS_HISTORY', icon: 'bi bi-bell', route: '/notifications', permissions: ['NOTIFICATION_VIEW'], searchTerms: ['notification list', 'alerts history'] } 
        ]
      },
      
      {
        title: 'SYSTEM',
        titleKey: 'MENU.SECTIONS.SYSTEM',
        items: [
          { label: 'Users', labelKey: 'MENU.USERS', icon: 'bi bi-person-badge', route: '/users', roles: ['SUPER_ADMIN', 'ADMIN'], permissions: ['USER_VIEW'], searchTerms: ['user management', 'staff'] },
          { label: 'Roles', labelKey: 'MENU.ROLES', icon: 'bi bi-shield-lock', route: '/roles', roles: ['SUPER_ADMIN', 'ADMIN'], permissions: ['ROLE_VIEW'], searchTerms: ['role management', 'permissions'] },
          { label: 'Settings', labelKey: 'MENU.SETTINGS', icon: 'bi bi-gear', route: '/settings', roles: ['SUPER_ADMIN', 'ADMIN'], permissions: ['SETTING_VIEW'], searchTerms: ['system settings', 'preferences'] },
          { label: 'Audit Logs', labelKey: 'MENU.AUDIT_LOGS', icon: 'bi bi-journal-text', route: '/audit-logs', roles: ['SUPER_ADMIN', 'ADMIN'], permissions: ['AUDIT_LOG_VIEW'], searchTerms: ['audit log', 'activity logs'] }
        ]
      }
    ];

    return allSections;
  }
}
