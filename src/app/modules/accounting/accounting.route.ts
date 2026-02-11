import { Routes } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: 'inventory/main',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/accounting-shell').then((m) => m.AccountingShell),
    children: [
      {
        path: '',
        redirectTo: 'inventory',
        pathMatch: 'full',
      },
      {
        // Lista de inventario
        path: 'inventory',
        loadComponent: () =>
          import('./pages/inventory/inventory').then(
            (m) => m.InventoryCompany
          ),
      },
      {
        // Editar inventario específico
        path: 'inventory/edit/:id',
        loadComponent: () =>
          import('./pages/inventory/update-inventary').then(
            (m) => m.UpdateInventary
          ),
      },
      {
        // Ventas
        path: 'sales',
        loadComponent: () =>
          import('./pages/sales/sale').then(
            (m) => m.Sale
          ),
      },
      {
        // Crear venta
        path: 'sales/create',
        loadComponent: () =>
          import('./pages/sales/create-sale').then(
            (m) => m.CreateSale
          ),
      },
      {
        // Cuentas
        path: 'accounts',
        loadComponent: () =>
          import('./pages/accounts/account').then(
            (m) => m.Account
          ),
      },
      {
        // Lista de cuentas
        path: 'accounts-list',
        loadComponent: () =>
          import('./pages/accounts/accounts-list').then(
            (m) => m.AccountsList
          ),
      },
      {
        // Crear cuenta
        path: 'accounts/create',
        loadComponent: () =>
          import('./pages/accounts/create-account').then(
            (m) => m.CreateAccount
          ),
      },
      {
        // Editar cuenta
        path: 'accounts/edit/:id',
        loadComponent: () =>
          import('./pages/accounts/update-counter').then(
            (m) => m.UpdateAccount
          ),
      }
    ]
  },
  {
    // Dashboard principal de contabilidad con métricas
    path: 'inventory/main',
    loadComponent: () =>
      import('./pages/inventory/main-inventory/main-inventory').then(
        (m) => m.MainInventory
      ),
  },
] as Routes;
