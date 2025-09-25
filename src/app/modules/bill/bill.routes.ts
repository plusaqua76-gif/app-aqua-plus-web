import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/bill/bill').then(m => m.Bill)
  },
  {
    path: 'update-bill/:id',
    loadComponent: () => import('./pages/update-bill/update-bill').then(m => m.UpdateBill)
  },
  {
    path: 'customer-debt',
    loadComponent: () => import('./pages/customer-debt/customer-debt').then(m => m.CustomerDebt)
  },
  {
    path: 'credit-customer',
    loadComponent: () => import('./pages/credit-customer/credit-customer').then(m => m.CreditCustomer)
  },
  {
    path: 'create-debt',
    loadComponent: () => import('./pages/create-debt/create-debt').then(m => m.CreateDebt)
  },
  {
    path: 'create-credit/:id',
    loadComponent: () => import('./pages/create-credit/create-credit').then(m => m.CreateCredit)
  },
  {
    path: 'update-debt/:id',
    loadComponent: () => import('./pages/update-debt/update-debt').then(m => m.UpdateDebt)
  },
  {
    path: 'print-bill/:id',
    loadComponent: () => import('./pages/print-bill/print-bill').then(m => m.PrintBill)
  }
] as Routes;
