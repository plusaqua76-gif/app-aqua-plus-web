import { Role } from '../../guards/guard-role/has-role-guard';

export interface NavItem {
  routeLink: string;
  icon: string;
  label: string;
  allowedRoles: Role[];
}

export const navbarData: NavItem[] = [
    {
        routeLink: 'start',
        icon: 'fas fa-chart-line',
        label: 'Métricas',
        allowedRoles: ['ADMIN', 'SUPER ADMIN']
    },
    {
        routeLink: 'client',
        icon: 'fas fa-users',
        label: 'Clientes',
        allowedRoles: ['ADMIN']
    },
    {
        routeLink: 'bill',
        icon: 'fas fa-file-invoice-dollar',
        label: 'Facturas',
        allowedRoles: ['ADMIN']
    },
    {
        routeLink: 'reading',
        icon: 'fas fa-clipboard-list',
        label: 'Lecturas',
        allowedRoles: ['ADMIN']
    },
    {
        routeLink: 'employee',
        icon: 'fas fa-user-tie',
        label: 'Empleados',
        allowedRoles: ['ADMIN']
    },
    {
        routeLink: 'counter',
        icon: 'fas fa-tachometer-alt',
        label: 'Contadores',
        allowedRoles: ['ADMIN']
    },
    {
        routeLink: 'enterprise',
        icon: 'fas fa-building',
        label: 'Empresas',
        allowedRoles: ['SUPER ADMIN']
    },
    {
      routeLink: 'user-access',
      icon: 'fas fa-user-shield',
      label: 'Acceso de Usuarios',
      allowedRoles: ['SUPER ADMIN']
    }
];
