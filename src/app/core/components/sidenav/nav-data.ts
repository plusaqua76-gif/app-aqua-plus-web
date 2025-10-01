import { NavItem } from '@interfaces/InavItem';

export const navbarData: NavItem[] = [
  {
    routeLink: 'start',
    icon: 'heroicon-chart-bar',
    label: 'Métricas',
    allowedRoles: ['ADMIN', 'SUPER ADMIN'],
  },
  {
    routeLink: 'fee',
    icon: 'heroicon-calculator',
    label: 'Tarifas',
    allowedRoles: ['ADMIN', 'SUPER ADMIN'],
  },
  {
    routeLink: 'client',
    icon: 'heroicon-users',
    label: 'Clientes',
    allowedRoles: ['ADMIN'],
  },
  {
    routeLink: 'bill',
    icon: 'heroicon-document-text',
    label: 'Facturas',
    allowedRoles: ['ADMIN'],
  },
  {
    routeLink: 'reading',
    icon: 'heroicon-clipboard-document-list',
    label: 'Lecturas',
    allowedRoles: ['ADMIN'],
  },
  {
    routeLink: 'employee',
    icon: 'heroicon-user-group',
    label: 'Empleados',
    allowedRoles: ['ADMIN'],
  },
  {
    routeLink: 'counter',
    icon: 'heroicon-scale',
    label: 'Contadores',
    allowedRoles: ['ADMIN'],
  },
  {
    routeLink: 'enterprise',
    icon: 'heroicon-building-office',
    label: 'Empresas',
    allowedRoles: ['SUPER ADMIN'],
  },
  {
    routeLink: 'user-access',
    icon: 'heroicon-shield-check',
    label: 'Acceso de Usuarios',
    allowedRoles: ['SUPER ADMIN'],
  },
  {
    routeLink: 'Inventory',
    icon: 'heroicon-shield-check',
    label: 'Contabilidad',
    allowedRoles: ['ADMIN'],
  },
  //   {
  //   routeLink: 'pqr-client',
  //   icon: 'heroicon-shield-check',
  //   label: 'Sistema PQR',
  //   allowedRoles: ['ADMIN', 'CLIENTE'],
  // },
      {
    routeLink: 'pqr-client',
    icon: 'heroicon-shield-check',
    label: 'Sistema PQR',
    allowedRoles: ['ADMIN'],
  },
  {
    routeLink: 'configuration-roles',
    icon: 'heroicon-shield-check',
    label: 'Configuración de Roles',
    allowedRoles: ['ADMIN'],
  },
];
