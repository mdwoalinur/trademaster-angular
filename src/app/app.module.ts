// the main module of the application, where all components, services, and other modules are declared and imported.
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// layout components
import { MainLayoutComponent } from './layout/main-layout/main-layout/main-layout.component';
import { SidebarComponent } from './layout/sidebar/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header/header.component';
import { FooterComponent } from './layout/footer/footer/footer.component';
import { DashboardComponent } from './modules/dashboard/dashboard/dashboard.component';

// product components
import { ProductListComponent } from './modules/products/product-list/product-list.component';
import { AddProductComponent } from './modules/products/add-product/add-product.component';
// Warehouse Components
import { WarehouseListComponent } from './modules/warehouse/warehouse-list.component';
import { AddWarehouseComponent } from './modules/warehouse/add-warehouse.component';
// supplier components
import { AddSupplierComponent } from './modules/suppliers/add-supplier.component';
import { SupplierListComponent } from './modules/suppliers/supplier-list.component';
// unit components
import { UnitListComponent } from './modules/unit/unit-list/unit-list.component';
import { AddUnitComponent } from './modules/unit/add-unit/add-unit.component';
// customer components 
import { CustomerListComponent } from './modules/customers/customer-list/customer-list.component';
import { AddCustomerComponent } from './modules/customers/add-customer/add-customer.component';
// category components
import { CategoryListComponent } from './modules/categories/category-list/category-list.component';
import { AddCategoryComponent } from './modules/categories/add-category/add-category.component';
// sale components
import { SaleListComponent } from './modules/sales/sale-list/sale-list.component';
import { AddSaleComponent } from './modules/sales/add-sale/add-sale.component';
import { SaleItemListComponent } from './modules/sale-item/sale-item-list/sale-item-list.component';
import { AddSaleItemComponent } from './modules/sale-item/add-sale-item/add-sale-item.component';
// product variation components
import { ProductVariationListComponent } from './modules/product-variation/product-variation-list/product-variation-list.component';
import { AddProductVariationComponent } from './modules/product-variation/add-product-variation/add-product-variation.component';
// point of sale component pos 
import { PosComponent } from './modules/sales/pos/pos.component';
// purchase components
import { PurchaseListComponent } from './modules/purchases/purchase-list/purchase-list.component';
import { PurchaseFormComponent } from './modules/purchases/purchase-form/purchase-form/purchase-form.component';
import { PurchaseViewComponent } from './modules/purchases/purchase-view/purchase-view/purchase-view.component';
import { PurchaseReturnListComponent } from './modules/purchase-returns/purchase-return-list/purchase-return-list.component';
import { PurchaseReturnFormComponent } from './modules/purchase-returns/purchase-return-form/purchase-return-form.component';
import { PurchaseReturnDetailsComponent } from './modules/purchase-returns/purchase-return-details/purchase-return-details.component';
// inventory components
import { StockOverviewComponent } from './modules/inventory/stock-overview/stock-overview.component';
import { StockMovementsComponent } from './modules/inventory/stock-movements/stock-movements.component';
import { StockAdjustmentsComponent } from './modules/inventory/stock-adjustments/stock-adjustments.component';
import { LowStockAlertsComponent } from './modules/inventory/low-stock-alerts/low-stock-alerts.component';
import { WastageCategoriesComponent } from './modules/inventory/wastage-categories/wastage-categories.component';
import { WastageRecordsComponent } from './modules/inventory/wastage-records/wastage-records.component';
import { AddWastageCategoryComponent } from './modules/inventory/wastage-categories/add-wastage-category/add-wastage-category.component';
import { AddWastageRecordComponent } from './modules/inventory/wastage-records/add-wastage-record/add-wastage-record.component';
// invoice components 
import { InvoiceThermalComponent } from './modules/sales/invoice-thermal/invoice-thermal/invoice-thermal.component';
import { InvoiceA4Component } from './modules/sales/invoice-a4/invoice-a4/invoice-a4.component';
import { PurchaseInvoiceComponent } from './modules/purchases/purchase-invoice/purchase-invoice/purchase-invoice.component';
import { SaleInvoiceComponent } from './modules/sales/sale-invoice/sale-invoice/sale-invoice.component';
// expense components
import { ExpenseCategoryListComponent } from './modules/expenses/expense-category/expense-category-list/expense-category-list.component';
import { AddEditCategoryComponent } from './modules/expenses/expense-category/add-edit-category/add-edit-category.component';
import { ExpenseListComponent } from './modules/expenses/expense-list/expense-list.component';
import { AddEditExpenseComponent } from './modules/expenses/add-edit-expense/add-edit-expense.component';
import { ExpenseDetailsComponent } from './modules/expenses/expense-details/expense-details.component';
import { ExpenseInvoiceComponent } from './modules/expenses/expense-invoice/expense-invoice.component';
import { PaymentListComponent } from './modules/payments/payment-list/payment-list.component';
import { AddEditPaymentComponent } from './modules/payments/add-edit-payment/add-edit-payment.component';
import { FinancialAccountListComponent } from './modules/payments/financial-account-list/financial-account-list.component';
import { AddEditFinancialAccountComponent } from './modules/payments/add-edit-financial-account/add-edit-financial-account.component';
import { PendingPaymentApprovalsComponent } from './modules/payments/pending-payment-approvals/pending-payment-approvals.component';
import { PaymentDetailsComponent } from './modules/payments/payment-details/payment-details.component';
import { PaymentDashboardComponent } from './modules/payments/payment-dashboard/payment-dashboard.component';
import { PaymentReconciliationComponent } from './modules/payments/payment-reconciliation/payment-reconciliation.component';
import { PaymentReportsComponent } from './modules/payments/payment-reports/payment-reports.component';
//profit loss component
import { ProfitLossComponent } from './modules/reports/profit-loss/profit-loss.component';
//sales report component 
import { SalesReportComponent } from './modules/reports/sales-report/sales-report.component';
import { InventoryReportComponent } from './modules/reports/inventory-report/inventory-report.component';
import { PurchaseReportComponent } from './modules/reports/purchase-report/purchase-report.component';
import { TaxReportComponent } from './modules/reports/tax-report/tax-report.component';
import { NotificationListComponent } from './modules/notification/notification-list/notification-list.component';
import { SaleReturnListComponent } from './modules/sales-return/sale-return-list/sale-return-list.component';
import { AddEditSaleReturnComponent } from './modules/sales-return/add-edit-sale-return/add-edit-sale-return.component';
import { SaleReturnDetailsComponent } from './modules/sales-return/sale-return-details/sale-return-details.component';
import { StockTransferListComponent } from './modules/stock-transfer/stock-transfer-list/stock-transfer-list.component';
import { AddEditStockTransferComponent } from './modules/stock-transfer/add-edit-stock-transfer/add-edit-stock-transfer.component';
import { StockTransferDetailsComponent } from './modules/stock-transfer/stock-transfer-details/stock-transfer-details.component';
import { UserListComponent } from './modules/user/user-list/user-list.component';
import { AddEditUserComponent } from './modules/user/add-edit-user/add-edit-user.component';
import { RoleListComponent } from './modules/roles/role-list/role-list.component';
import { AddEditRoleComponent } from './modules/roles/add-edit-role/add-edit-role.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { LoginComponent } from './modules/login/login/login.component';
import { AuditLogListComponent } from './modules/audit-log/audit-log-list/audit-log-list.component';
import { AuditLogDetailsComponent } from './modules/audit-log/audit-log-details/audit-log-details.component';
import { SettingsComponent } from './modules/settings/settings/settings.component';
import { BarcodeScannerComponent } from './modules/barcode-scanner/barcode-scanner/barcode-scanner.component';
import { BatchLabelPrintComponent } from './modules/products/batch-label-print/batch-label-print/batch-label-print.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SearchComponent } from './modules/search/search.component';
import { ProfileComponent } from './modules/profile/profile/profile.component';
import { ChangePasswordComponent } from './modules/profile/change-password/change-password.component';
import { ProductMiniComponent } from './shared/components/product-mini/product-mini.component';
import { CustomerMiniComponent } from './shared/components/customer-mini/customer-mini.component';
import { SupplierMiniComponent } from './shared/components/supplier-mini/supplier-mini.component';
import { StatusLabelPipe } from './shared/pipes/status-label.pipe';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    SidebarComponent,
    HeaderComponent,
    FooterComponent,
    DashboardComponent,
    // product components
    ProductListComponent,
    AddProductComponent,
    // warehouse components
    WarehouseListComponent,    
    AddWarehouseComponent,
    // supplier components
    SupplierListComponent,
    AddSupplierComponent,
    // unit components
    UnitListComponent,
    AddUnitComponent,
    // customer components
    CustomerListComponent,
    AddCustomerComponent,
    // category components
    CategoryListComponent,
    AddCategoryComponent,
    // sale components
    SaleListComponent,
    AddSaleComponent,
    SaleItemListComponent,
    AddSaleItemComponent,
    // product variation components
    ProductVariationListComponent,
    AddProductVariationComponent,
    // point of sale component pos 
    PosComponent,
    // purchase components
    PurchaseListComponent,
    PurchaseFormComponent,  
    PurchaseViewComponent,
    PurchaseReturnListComponent,
    PurchaseReturnFormComponent,
    PurchaseReturnDetailsComponent,
    // inventory components
    StockOverviewComponent, 
    StockMovementsComponent,
    StockAdjustmentsComponent, 
    LowStockAlertsComponent, 
    WastageCategoriesComponent, 
    WastageRecordsComponent,
    AddWastageCategoryComponent,
    AddWastageRecordComponent,
    // invoice components (no duplicates)
    InvoiceThermalComponent,
    InvoiceA4Component,
    PurchaseInvoiceComponent,
    SaleInvoiceComponent,
    // expense components
    ExpenseCategoryListComponent,
    AddEditCategoryComponent,
    ExpenseListComponent,
    AddEditExpenseComponent,
    ExpenseDetailsComponent,
    ExpenseInvoiceComponent,
    //payment components 
    PaymentListComponent,
    AddEditPaymentComponent,
    FinancialAccountListComponent,
    AddEditFinancialAccountComponent,
    PendingPaymentApprovalsComponent,
    PaymentDetailsComponent,
    PaymentDashboardComponent,
    PaymentReconciliationComponent,
    PaymentReportsComponent,
    //report components 
    ProfitLossComponent,
    //sales report component
    SalesReportComponent,
    //inventory report component
    InventoryReportComponent,
    //purchase report component
    PurchaseReportComponent,
    TaxReportComponent,
    NotificationListComponent,
    SaleReturnListComponent,
    AddEditSaleReturnComponent,
    SaleReturnDetailsComponent,
    StockTransferListComponent,
    AddEditStockTransferComponent,
    StockTransferDetailsComponent,
    UserListComponent,
    AddEditUserComponent,
    RoleListComponent,
    AddEditRoleComponent,
    LoginComponent,
    AuditLogListComponent,
    AuditLogDetailsComponent,
    SettingsComponent,
    BarcodeScannerComponent,
    BatchLabelPrintComponent,
    SearchComponent,
    ProfileComponent,
    ChangePasswordComponent,
    ProductMiniComponent,
    CustomerMiniComponent,
    SupplierMiniComponent,
    StatusLabelPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,             
    HttpClientModule,
    ReactiveFormsModule,
    MatDialogModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'en-US' },
  { provide: DEFAULT_CURRENCY_CODE, useValue: 'BDT' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
