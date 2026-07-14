# TradeMaster Angular Frontend

Angular 13 client for the TradeMaster Inventory and Stock Management System.

## Requirements

- Node.js compatible with Angular CLI 13
- npm
- TradeMaster backend running on `http://localhost:8080`

## Run and build

```bash
npm install
npm start
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

Development API configuration is in `src/environments/environment.ts`. Production uses the relative `/api` URL and expects a same-origin reverse proxy.

## Modules

Authentication/profile, dashboard, products and variations, customers, suppliers, warehouses, purchases and returns, sales/POS/returns, inventory and transfers, payments/accounts/reconciliation, expenses, wastage, reports, notifications, users/roles/settings/audit logs, global search, barcode scanning, themes, and English/Bangla runtime translation.

## Security model

- JWT bearer tokens are attached by the Angular HTTP interceptor.
- Route guards protect the authenticated application shell.
- UI permission filtering improves usability but is not a security boundary; backend authorization is authoritative.
- Receipt and payment-attachment downloads use authenticated API requests.
- Profile images and product/customer/supplier images are intentionally public display assets.

## Internationalization

English is the default. Runtime translations are stored in `src/assets/i18n/en.json` and `bn.json`. Translate static labels only; business data and API enum values remain unchanged.

## Known limitations

- Angular 13 is outside current upstream support and `npm audit` reports high-severity advisories requiring a planned major Angular upgrade.
- The initial production bundle exceeds the current 2 MB budget.
- Camera barcode scanning requires HTTPS or localhost and physical device verification.
- The repository currently has no maintained end-to-end test suite.

See `THIRD_PARTY_NOTICES.md` for direct dependency licensing.
