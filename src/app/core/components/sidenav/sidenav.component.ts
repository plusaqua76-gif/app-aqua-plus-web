import { EnterpriseIdService } from '@services/enterpriceId.service';
import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  HostListener,
  inject,
  computed,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, NgClass, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HasRoleDirective } from '../../directives/has-role';
import { rxResource } from '@angular/core/rxjs-interop';
import { NavsMenuRolService } from '@services/navsMenuRol.service';
import { NavItem } from '@interfaces/InavItem';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from '../../services/storage.service';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

interface UserData {
  empresaId?: number;
  rolId?: number;
  nombre?: string;
}

@Component({
  selector: 'app-sidenav',
  imports: [
    CommonModule,
    NgClass,
    RouterLink,
    RouterLinkActive,
    HasRoleDirective,
  ],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('350ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('350ms', style({ opacity: 0 })),
      ]),
    ]),
    trigger('rotate', [
      transition(':enter', [
        animate(
          '1000ms',
          keyframes([
            style({ transform: 'rotate(0deg)', offset: '0' }),
            style({ transform: 'rotate(2turn)', offset: '1' }),
          ])
        ),
      ]),
    ]),
  ],
})
export class SidenavComponent implements OnInit {
  @Output() toggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  screenWidth = 0;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.isBrowser) {
      this.screenWidth = window.innerWidth;
      if (this.screenWidth <= 768) {
        this.collapsed = false;
      }
      this.toggleSideNav.emit({
        collapsed: this.collapsed,
        screenWidth: this.screenWidth,
      });
    }
  }

  private readonly enterpriseIdService = inject(EnterpriseIdService);
  private readonly navsMenuRolService = inject(NavsMenuRolService);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);
  private readonly storageService = inject(StorageService);

  // Signals para datos del usuario usando el StorageService
  readonly userData = computed(() => {
    return this.storageService.getObject<UserData>('userData');
  });

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  readonly rolId = computed(() => {
    const data = this.userData();
    return data?.rolId || null;
  });

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

  // Orden predefinido para los elementos del menú
  private readonly menuOrder: string[] = [
    'start',
    'fee',
    'client',
    'bill',
    'reading',
    'employee',
    'counter',
    'enterprise',
    'bills-users',
    'user-access',
    'Inventory',
    'pqr-client',
    'pqr-client/pqr-enterprice-clients',
    'configuration-roles',
    'reports'
  ];

  /**
   * Transforma y ordena los elementos del menú según el orden predefinido
   */
  private transformNavItems(navItems: NavItem[]): NavItem[] {
    if (!navItems || navItems.length === 0) return [];

    // Crear un mapa para acceso rápido a los elementos
    const itemsMap = new Map<string, NavItem>();
    for (const item of navItems) {
      itemsMap.set(item.routeLink, item);
    }

    const orderedItems: NavItem[] = [];

    for (const routeLink of this.menuOrder) {
      if (itemsMap.has(routeLink)) {
        orderedItems.push(itemsMap.get(routeLink) as NavItem);
        itemsMap.delete(routeLink); // Remover del mapa para evitar duplicados
      }
    }

    for (const item of itemsMap.values()) {
      orderedItems.push(item);
    }

    return orderedItems;
  }

  enterpriseInfo = rxResource({
    stream: () => this.enterpriseIdService.getEnterpriseInfo(),
  });

  dataNavsUser = rxResource({
    params: () => ({
      empresaId: this.empresaId(),
      rolId: this.rolId()
    }),
    stream: ({ params }) => {
      const { empresaId, rolId } = params;
      if (!empresaId || !rolId) {
        return of(null);
      }
      return this.navsMenuRolService.getNavsMenuRol(empresaId, rolId).pipe(
        map(response => {
          if (response?.response) {
            const orderedNavItems = this.transformNavItems(response.response);
            return {
              ...response,
              response: orderedNavItems
            };
          }
          return response;
        })
      );
    }
  })

  ngOnInit(): void {
    if (this.isBrowser) {
      this.screenWidth = window.innerWidth;
    }
    this.collapsed = false;

    this.toggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.toggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.toggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  onItemClick(): void {
    if (this.screenWidth <= 768 && this.collapsed) {
      setTimeout(() => {
        this.closeSidenav();
      }, 150);
    }
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }
}
