import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-accounting-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-6">
      <div>
        <div class="relative overflow-hidden shadow-xl sm:rounded-2xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl border border-white/20 dark:border-slate-700/30">
          <!-- Navigation Tabs -->
          <div class="flex overflow-x-auto scrollbar-hide border-b border-white/20 dark:border-slate-700/30">
            <button
              type="button"
              (click)="navigateTo('/shell/accounting/inventory')"
              [class]="getTabClasses('/shell/accounting/inventory')"
              class="nav-tab"
            >
              <i class="fas fa-warehouse"></i>
              <span>Inventario</span>
            </button>

            <button
              type="button"
              (click)="navigateTo('/shell/accounting/sales')"
              [class]="getTabClasses('/shell/accounting/sales')"
              class="nav-tab"
            >
              <i class="fas fa-shopping-cart"></i>
              <span>Ventas</span>
            </button>

            <button
              type="button"
              (click)="navigateTo('/shell/accounting/accounts')"
              [class]="getTabClasses('/shell/accounting/accounts')"
              class="nav-tab"
            >
              <i class="fas fa-file-invoice-dollar"></i>
              <span>Cuentas</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Content Area - Router Outlet -->
      <div class="relative">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }

    .nav-tab {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      flex-shrink: 0;
      padding: 1rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-bottom: 2px solid transparent;
      color: rgb(156 163 175);
      background: transparent;
    }

    .nav-tab i {
      font-size: 1rem;
      transition: transform 0.3s ease;
    }

    .nav-tab:hover {
      color: rgb(209 213 219);
      background: rgba(255, 255, 255, 0.05);
    }

    .nav-tab:hover i {
      transform: scale(1.1);
    }

    .nav-tab.active {
      color: rgb(96 165 250);
      border-bottom-color: rgb(59 130 246);
      background: rgba(59, 130, 246, 0.1);
      font-weight: 600;
    }

    .nav-tab.active i {
      color: rgb(59 130 246);
    }

    @media (prefers-color-scheme: dark) {
      .nav-tab.active {
        color: rgb(147 197 253);
        border-bottom-color: rgb(96 165 250);
        background: rgba(96, 165, 250, 0.15);
      }

      .nav-tab.active i {
        color: rgb(96 165 250);
      }
    }

    @media (max-width: 640px) {
      .nav-tab {
        padding: 0.875rem 1.25rem;
        font-size: 0.8125rem;
      }

      .nav-tab i {
        font-size: 0.875rem;
      }
    }
  `]
})
export class AccountingShell {
  private readonly router = inject(Router);

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getTabClasses(route: string): string {
    const currentUrl = this.router.url;

    // Verificar si la ruta actual comienza con la ruta del tab
    // Esto hace que el tab se mantenga activo incluso en subrutas
    const isActive = currentUrl.startsWith(route) ||
                     currentUrl.includes(route.replace('/shell/accounting/', '/shell/Inventory/'));

    return isActive ? 'active' : '';
  }
}
