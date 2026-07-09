import { inject, Injectable, signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { IBreadcrumb } from '@interfaces/Ibreadcrumb';
import { filter, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private readonly _breadcrumbs = signal<IBreadcrumb[]>([]);

  breadcrumbs = this._breadcrumbs.asReadonly();

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly routeLabels: { [key: string]: string } = {
    // Rutas principales
    'shell': 'Home',
    'start': 'Métricas',

    // Módulo de clientes
    'client': 'Clientes',
    'create-client': 'Crear Cliente',
    'update-client': 'Actualizar Cliente',
    'client-data': 'Cliente',

    // Módulo de facturas/bills
    'bill': 'Facturas',
    'customer-debt': 'Deudas de Clientes',
    'credit-customer': 'Abonos de Facturas',
    'create-debt': 'Crear Deuda',
    'create-credit': 'Crear Abono',
    'update-bill': 'Actualizar Factura',
    'print-bill': 'Imprimir Factura',
    'bill-data': 'Factura',
    'update-debt': 'Actualizar Deuda',
    'welcome-user': 'Bienvenida',
    'electronic-invoicing': 'Facturación Electrónica',
    'enterprice-dian': 'Empresa DIAN',


    'reading': 'Lecturas',
    'update-reading': 'Actualizar Lectura',
    'reading-data': 'Lectura',
    'history-reading': 'Histórico de Lecturas',



    'employee': 'Empleados',
    'create-employee': 'Crear Empleado',
    'update-employee': 'Actualizar Empleado',
    'employee-data': 'Empleado',
    'payroll': 'Nómina',


    'counter': 'Contadores',
    'create-counter': 'Crear Contador',
    'update-counter': 'Actualizar Contador',
    'counter-data': 'Contador',

    'enterprise': 'Empresa',
    'create-enterprise': 'Crear Empresa',
    'update-enterprise': 'Actualizar Empresa',
    'pqr-enterprice-clients': 'Clientes PQR',
    'bills-users': 'Usuarios Facturación',


    'Inventory': 'Inventario',
    'inventory': 'Inventario',
    'main': 'Dashboard',
    'sales': 'Ventas',
    'accounts': 'Cuentas',
    'accounts-list': 'Cuentas',
    'create': 'Crear',
    'update': 'Actualizar',
    'edit': 'Editar',


    'fee': 'Tarifas',
    'create-fee': 'Crear Tarifa',
    'update-fee': 'Actualizar Tarifa',


    'user-access': 'Acceso de Usuarios',
    'configuration-roles': 'Configuración de Roles',
    'pqr-client': 'PQRS',


    'auth': 'Autenticación',
    'login': 'Iniciar Sesión',
    'register': 'Registrarse',
    'forgot-password': 'Olvidé mi Contraseña',
    'recover-password': 'Recuperar Contraseña',


    'profile': 'Perfil',
    'settings': 'Configuración',
    'dashboard': 'Panel de Control',
    'admin': 'Administración',
    'reports': 'Reportes',
    'users': 'Usuarios',
    'services': 'Servicios',
    'contact': 'Contacto',
    'about': 'Acerca de'
  };

  constructor() {
    this.initBreadcrumbListener();
  }

  private initBreadcrumbListener(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.createBreadcrumbs(this.activatedRoute.root))
      )
      .subscribe(breadcrumbs => {
        this._breadcrumbs.set(breadcrumbs);
      });
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: IBreadcrumb[] = []): IBreadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return this.addHomeBreadcrumb(breadcrumbs);
    }

    for (const child of children) {
      const segments = child.snapshot.url;

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        url += `/${segment.path}`;

        // Solo crear breadcrumb para el primer segmento o segmentos que no sean números (IDs)
        if (i === 0 || !this.isNumeric(segment.path)) {
          // Obtener el label del objeto configurado o usar el path capitalizado
          const routeKey = segment.path.toLowerCase();
          const label = this.routeLabels[routeKey] || this.capitalizeFirst(segment.path);

          const breadcrumb: IBreadcrumb = {
            label,
            url,
            isActive: false
          };

          breadcrumbs.push(breadcrumb);
        }
      }

      // Procesar recursivamente cada child
      breadcrumbs = this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return this.addHomeBreadcrumb(breadcrumbs);
  }

  private addHomeBreadcrumb(breadcrumbs: IBreadcrumb[]): IBreadcrumb[] {
    // Verificar si ya existe un breadcrumb para shell o start
    const hasShell = breadcrumbs.some(b => b.url.includes('/shell'));

    // Si no hay ningún breadcrumb relacionado con shell, agregar Home
    if (!hasShell) {
      breadcrumbs.unshift({
        label: 'Home',
        url: '/shell',
        isActive: false
      });
    } else {
      // Si hay breadcrumbs, verificar si el primero es start, entonces agregar Home antes
      const firstIsStart = breadcrumbs.length > 0 && breadcrumbs[0].url === '/shell/start';
      if (firstIsStart) {
        breadcrumbs.unshift({
          label: 'Home',
          url: '/shell',
          isActive: false
        });
      }
    }

    // Marcar el último como activo
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].isActive = true;
    }

    return breadcrumbs;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private isNumeric(str: string): boolean {
    return /^\d+$/.test(str);
  }
}
