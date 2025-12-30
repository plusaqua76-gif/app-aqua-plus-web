
import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/electronic-invoicing-wrapper/electronic-invoicing-wrapper').then(m => m.ElectronicInvoicingWrapper),
  },
  {
    path: 'create',
    loadComponent: () => import('./components/create-invoice').then(m => m.CreateInvoiceComponent),
  },
] as Routes;
