import { Routes } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: 'inventory',
    pathMatch: 'full',
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./pages/inventory/inventory').then(
        (m) => m.InventoryCompany
      ),
  },
  {
    path: 'sales',
    loadComponent: () =>
      import('./pages/sales/sale').then(
        (m) => m.Sale
      ),
  },
  {
    path: 'sales/create',
    loadComponent: () =>
      import('./pages/sales/create-sale').then(
        (m) => m.CreateSale
      ),
  },
  {
    path: 'accounts',
    loadComponent: () =>
      import('./pages/accounts/account').then(
        (m) => m.Account
      ),
  },
  {
    path: 'accounts/create',
    loadComponent: () =>
      import('./pages/accounts/create-account').then(
        (m) => m.CreateAccount
      ),
  }
] as Routes;
