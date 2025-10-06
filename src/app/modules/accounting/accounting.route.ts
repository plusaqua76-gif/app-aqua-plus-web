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
      import('./pages/inventorycompany/inventorycompany').then(
        (m) => m.InventoryCompany
      ),
  },
] as Routes;
