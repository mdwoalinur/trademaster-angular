import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout/main-layout.component';
import { DashboardComponent } from './modules/dashboard/dashboard/dashboard.component';

// Products & related
import { ProductListComponent } from './modules/products/product-list/product-list.component';
import { AddProductComponent } from './modules/products/add-product/add-product.component';
import { ProductVariationListComponent } from './modules/product-variation/product-variation-list/product-variation-list.component';
import { AddProductVariationComponent } from './modules/product-variation/add-product-variation/add-product-variation.component';
//category components
import { CategoryListComponent } from './modules/categories/category-list/category-list.component';
import { AddCategoryComponent } from './modules/categories/add-category/add-category.component';

// Sales & Sale Items
import { SaleListComponent } from './modules/sales/sale-list/sale-list.component';
import { AddSaleComponent } from './modules/sales/add-sale/add-sale.component';
import { SaleItemListComponent } from './modules/sale-item/sale-item-list/sale-item-list.component';
import { AddSaleItemComponent } from './modules/sale-item/add-sale-item/add-sale-item.component';

//warehouse components
import { WarehouseListComponent } from './modules/warehouse/warehouse-list.component';
import { AddWarehouseComponent } from './modules/warehouse/add-warehouse.component';
//supplier components
import { SupplierListComponent } from './modules/suppliers/supplier-list.component';
import { AddSupplierComponent } from './modules/suppliers/add-supplier.component';
//unit components 
import { UnitListComponent } from './modules/unit/unit-list/unit-list.component';
import { AddUnitComponent } from './modules/unit/add-unit/add-unit.component';
//customer components 
import { CustomerListComponent } from './modules/customers/customer-list/customer-list.component';
import { AddCustomerComponent } from './modules/customers/add-customer/add-customer.component';
//point of sale pos component 
import { PosComponent } from './modules/sales/pos/pos.component';
//purchase components 
import { PurchaseFormComponent } from './modules/purchases/purchase-form/purchase-form/purchase-form.component';
import { PurchaseListComponent } from './modules/purchases/purchase-list/purchase-list.component';
import { PurchaseViewComponent } from './modules/purchases/purchase-view/purchase-view/purchase-view.component';
import { PurchaseReturnListComponent } from './modules/purchase-returns/purchase-return-list/purchase-return-list.component';
import { PurchaseReturnFormComponent } from './modules/purchase-returns/purchase-return-form/purchase-return-form.component';
import { PurchaseReturnDetailsComponent } from './modules/purchase-returns/purchase-return-details/purchase-return-details.component';
//inventory components
import { StockOverviewComponent } from './modules/inventory/stock-overview/stock-overview.component';
import { StockMovementsComponent } from './modules/inventory/stock-movements/stock-movements.component';
import { StockAdjustmentsComponent } from './modules/inventory/stock-adjustments/stock-adjustments.component';
import { LowStockAlertsComponent } from './modules/inventory/low-stock-alerts/low-stock-alerts.component';
//wastage components
import { WastageCategoriesComponent } from './modules/inventory/wastage-categories/wastage-categories.component';
import { WastageRecordsComponent } from './modules/inventory/wastage-records/wastage-records.component';
import { AddWastageRecordComponent } from './modules/inventory/wastage-records/add-wastage-record/add-wastage-record.component';
import { AddWastageCategoryComponent } from './modules/inventory/wastage-categories/add-wastage-category/add-wastage-category.component';
//expnese components 
import { ExpenseCategoryListComponent } from './modules/expenses/expense-category/expense-category-list/expense-category-list.component';
import { AddEditCategoryComponent } from './modules/expenses/expense-category/add-edit-category/add-edit-category.component';
import { AddEditExpenseComponent } from './modules/expenses/add-edit-expense/add-edit-expense.component';
import { ExpenseListComponent } from './modules/expenses/expense-list/expense-list.component';
import { ExpenseDetailsComponent } from './modules/expenses/expense-details/expense-details.component';
//payment components 
import { AddEditPaymentComponent } from './modules/payments/add-edit-payment/add-edit-payment.component';
import { PaymentListComponent } from './modules/payments/payment-list/payment-list.component';
import { FinancialAccountListComponent } from './modules/payments/financial-account-list/financial-account-list.component';
import { AddEditFinancialAccountComponent } from './modules/payments/add-edit-financial-account/add-edit-financial-account.component';
import { PendingPaymentApprovalsComponent } from './modules/payments/pending-payment-approvals/pending-payment-approvals.component';
import { PaymentDetailsComponent } from './modules/payments/payment-details/payment-details.component';
import { PaymentDashboardComponent } from './modules/payments/payment-dashboard/payment-dashboard.component';
import { PaymentReconciliationComponent } from './modules/payments/payment-reconciliation/payment-reconciliation.component';
import { PaymentReportsComponent } from './modules/payments/payment-reports/payment-reports.component';
import { ProfitLossComponent } from './modules/reports/profit-loss/profit-loss.component';
import { SalesReportComponent } from './modules/reports/sales-report/sales-report.component';
import { InventoryReportComponent } from './modules/reports/inventory-report/inventory-report.component';
import { PurchaseReportComponent } from './modules/reports/purchase-report/purchase-report.component';
import { TaxReportComponent } from './modules/reports/tax-report/tax-report.component';
import { NotificationListComponent } from './modules/notification/notification-list/notification-list.component';
//sale return components
import { AddEditSaleReturnComponent } from './modules/sales-return/add-edit-sale-return/add-edit-sale-return.component';
import { SaleReturnListComponent } from './modules/sales-return/sale-return-list/sale-return-list.component';
import { SaleReturnDetailsComponent } from './modules/sales-return/sale-return-details/sale-return-details.component';
import { StockTransferDetailsComponent } from './modules/stock-transfer/stock-transfer-details/stock-transfer-details.component';
import { AddEditStockTransferComponent } from './modules/stock-transfer/add-edit-stock-transfer/add-edit-stock-transfer.component';
import { StockTransferListComponent } from './modules/stock-transfer/stock-transfer-list/stock-transfer-list.component';
import { AddEditUserComponent } from './modules/user/add-edit-user/add-edit-user.component';
import { UserListComponent } from './modules/user/user-list/user-list.component';
import { AddEditRoleComponent } from './modules/roles/add-edit-role/add-edit-role.component';
import { RoleListComponent } from './modules/roles/role-list/role-list.component';
import { LoginComponent } from './modules/login/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AuditLogListComponent } from './modules/audit-log/audit-log-list/audit-log-list.component';
import { AuditLogDetailsComponent } from './modules/audit-log/audit-log-details/audit-log-details.component';
import { SettingsComponent } from './modules/settings/settings/settings.component';
import { SearchComponent } from './modules/search/search.component';
import { ProfileComponent } from './modules/profile/profile/profile.component';
import { ChangePasswordComponent } from './modules/profile/change-password/change-password.component';


const routes: Routes = [
  
   { path: 'login', component: LoginComponent },
   { path: 'forgot-password', component: LoginComponent },
   { path: 'forgot-password/verify', component: LoginComponent },
   { path: 'forgot-password/reset', component: LoginComponent },
   { path: 'forgot-password/success', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      { path: 'dashboard', component: DashboardComponent },

      // ========== PRODUCTS (with nested children) ==========
      {
        path: 'products',
        children: [
          { path: '', component: ProductListComponent },
          { path: 'add', component: AddProductComponent },
          { path: 'edit/:id', component: AddProductComponent },
          { path: 'variations', component: ProductVariationListComponent },
          { path: 'variations/add', component: AddProductVariationComponent },
          { path: 'variations/edit/:id', component: AddProductVariationComponent },
          { path: 'categories', component: CategoryListComponent },
          { path: 'categories/add', component: AddCategoryComponent },
          { path: 'categories/edit/:id', component: AddCategoryComponent }
        ]
      },

      // ========== SALES (with nested sale items) ==========
      {
        path: 'sales',
        children: [
          { path: '', component: SaleListComponent },
          { path: 'pos', component: PosComponent },
          { path: 'add', component: AddSaleComponent },
          { path: 'edit/:id', component: AddSaleComponent },
          { path: 'items', component: SaleItemListComponent },
          { path: 'items/add', component: AddSaleItemComponent },
          { path: 'items/edit/:id', component: AddSaleItemComponent }
        ]
      },

      // // ========== PURCHASES (with nested purchase items) ==========
      {
        path: 'purchases',
        children: [
          { path: '', component: PurchaseListComponent },
          { path: 'add', component: PurchaseFormComponent },
          { path: 'edit/:id', component: PurchaseFormComponent },
          { path: 'view/:id', component: PurchaseViewComponent }
        ]
      },
            //all general routes 
      // warehouse routes
      { path: 'warehouses', component: WarehouseListComponent },
      { path: 'warehouses/add', component: AddWarehouseComponent },
      { path: 'warehouses/edit/:id', component: AddWarehouseComponent },
      //supplier routes
      { path: 'suppliers', component: SupplierListComponent },
      { path: 'suppliers/add', component: AddSupplierComponent },
      { path: 'suppliers/edit/:id', component: AddSupplierComponent },
      //unit routes
      { path: 'units', component: UnitListComponent },
      { path: 'units/add', component: AddUnitComponent },
      { path: 'units/edit/:id', component: AddUnitComponent },
      //customer routes
      { path: 'customers', component: CustomerListComponent },
      { path: 'customers/add', component: AddCustomerComponent },
      { path: 'customers/edit/:id', component: AddCustomerComponent },
      //point of sale route is defined under /sales children
      //payments routes 
      { path: 'payments', component: PaymentListComponent },
      { path: 'payments/add', component: AddEditPaymentComponent },
      { path: 'payments/edit/:id', component: AddEditPaymentComponent },
      { path: 'payments/view/:id', component: PaymentDetailsComponent },
      { path: 'payments/dashboard', component: PaymentDashboardComponent },
      { path: 'payments/pending-approvals', component: PendingPaymentApprovalsComponent },
      { path: 'payments/accounts', component: FinancialAccountListComponent },
      { path: 'payments/accounts/add', component: AddEditFinancialAccountComponent },
      { path: 'payments/accounts/edit/:id', component: AddEditFinancialAccountComponent },
      { path: 'payments/reconciliation', component: PaymentReconciliationComponent },
      { path: 'payments/reports', component: PaymentReportsComponent },
      { path: 'reports/profit-loss', component: ProfitLossComponent },
      { path: 'reports/sales', component: SalesReportComponent },
      { path: 'reports/inventory', component: InventoryReportComponent },
      { path: 'reports/purchases', component: PurchaseReportComponent },
      { path: 'reports/tax', component: TaxReportComponent },
      { path: 'notifications', component: NotificationListComponent },
      //sale return routes 
      { path: 'sales-returns', component: SaleReturnListComponent },
      { path: 'sales-returns/add/:saleId', component: AddEditSaleReturnComponent },
      { path: 'sales-returns/view/:id', component: SaleReturnDetailsComponent },
      //purchase return routes
      { path: 'purchase-returns', component: PurchaseReturnListComponent },
      { path: 'purchase-returns/add', component: PurchaseReturnFormComponent },
      { path: 'purchase-returns/edit/:id', component: PurchaseReturnFormComponent },
      { path: 'purchase-returns/view/:id', component: PurchaseReturnDetailsComponent },
      //stock transfer routes 
      { path: 'stock-transfers', component: StockTransferListComponent },
      { path: 'stock-transfers/add', component: AddEditStockTransferComponent },
      { path: 'stock-transfers/view/:id', component: StockTransferDetailsComponent },
      //user management router 
      { path: 'users', component: UserListComponent },
      { path: 'users/add', component: AddEditUserComponent },
      { path: 'users/edit/:id', component: AddEditUserComponent },
      //role management routes 
      { path: 'roles', component: RoleListComponent },
      { path: 'roles/add', component: AddEditRoleComponent },
      { path: 'roles/edit/:id', component: AddEditRoleComponent },
      //Audit log route 
     { path: 'audit-logs', component: AuditLogListComponent, canActivate: [AuthGuard] },
     { path: 'audit-logs/view/:id', component: AuditLogDetailsComponent, canActivate: [AuthGuard]},
     { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
     { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
     { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
     { path: 'search', component: SearchComponent },

      

       // ========== INVENTORY MODULE ==========
      {
        path: 'inventory',
        children: [
          { path: '', component: StockOverviewComponent },                          // /inventory
          { path: 'movements', component: StockMovementsComponent },               // /inventory/movements
          { path: 'adjustments', component: StockAdjustmentsComponent },           // /inventory/adjustments
          { path: 'low-stock', component: LowStockAlertsComponent },               // /inventory/low-stock
          { path: 'wastage/categories', component: WastageCategoriesComponent },   // /inventory/wastage/categories
          { path: 'wastage/categories/add', component: AddWastageCategoryComponent },
          { path: 'wastage/categories/edit/:id', component: AddWastageCategoryComponent },
          { path: 'wastage/records', component: WastageRecordsComponent },         // /inventory/wastage/records
          { path: 'wastage/records/add', component: AddWastageRecordComponent },
          { path: 'wastage/records/edit/:id', component: AddWastageRecordComponent },
          
        ]
      },
 {
  path: 'expenses',
  children: [
    { path: 'categories', component: ExpenseCategoryListComponent },
    { path: 'categories/add', component: AddEditCategoryComponent },
    { path: 'categories/edit/:id', component: AddEditCategoryComponent },
    
    { path: '', component: ExpenseListComponent },
    { path: 'add', component: AddEditExpenseComponent },
    { path: 'edit/:id', component: AddEditExpenseComponent },
     { path: 'view/:id', component: ExpenseDetailsComponent },
  ]
}
     
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
