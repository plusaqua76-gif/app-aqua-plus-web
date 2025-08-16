import { Component, signal, computed, inject, OnInit, DestroyRef, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface SidebarItem {
  icon: string | SafeHtml;
  label: string;
  route?: string;
  children?: SidebarItem[];
}
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (isMobile() && isExpanded()) {
      <div
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        (click)="collapse()"
      ></div>
    }

    <aside
      class="fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      [class.w-64]="isExpanded()"
      [class.w-16]="!isExpanded() && !isMobile()"
      [class.-translate-x-full]="isMobile() && !isExpanded()"
      [class.translate-x-0]="!isMobile() || isExpanded()"
    >
      <!-- Header -->
      <div class="flex items-center px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        @if (isExpanded()) {
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
              </svg>
            </div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Bordones SAS</h1>
          </div>
        } @else {
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
            </svg>
          </div>
        }
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 px-3 py-4 overflow-y-auto">
        <ul class="space-y-1">
          @for (item of sidebarItems(); track item.label) {
            <li>
              <a
                [routerLink]="item.route || '/'"
                class="group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                [class.text-gray-700]="true"
                [class.dark:text-gray-200]="true"
                [title]="!isExpanded() ? item.label : ''"
              >
                <!-- Ícono -->
                <span
                  class="flex-shrink-0 transition-colors duration-200 text-gray-500 dark:text-gray-400"
                  [innerHTML]="item.icon"
                ></span>

                <!-- Label con animación -->
                @if (isExpanded()) {
                  <span class="ml-3 transition-opacity duration-200 opacity-100">
                    {{ item.label }}
                  </span>
                } @else {
                  <span class="ml-3 transition-opacity duration-200 opacity-0 w-0 overflow-hidden">
                    {{ item.label }}
                  </span>
                }
              </a>
            </li>
          }
        </ul>
      </nav>

      <!-- Footer -->
      <div class="border-t border-gray-200 dark:border-gray-700 p-4">
        @if (isExpanded()) {
          <div class="flex items-center space-x-3">

          </div>
        } @else {
          <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mx-auto" title="Usuario">
            <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
            </svg>
          </div>
        }
      </div>
    </aside>

    <!-- Toggle Button -->
    <button
      (click)="toggle()"
      class="fixed top-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
      [class.left-4]="!isExpanded() && !isMobile()"
      [class.left-52]="isExpanded() && !isMobile()"
      [class.left-4]="isMobile()"
      [attr.aria-label]="isExpanded() ? 'Contraer sidebar' : 'Expandir sidebar'"
    >
      @if (isExpanded()) {
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
        </svg>
      } @else {
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
        </svg>
      }
    </button>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Animaciones suaves para las transiciones */
    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }


    /* Mejoras de accesibilidad */
    @media (prefers-reduced-motion: reduce) {
      .transition-all {
        transition: none;
      }
    }


  `]
})
export class SidebarComponent implements OnInit {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Signals para manejo reactivo del estado
  private expanded = signal(false);
  private mobile = signal(false);

  // Computed signals
  isExpanded = computed(() => this.expanded());
  isMobile = computed(() => this.mobile());

  // Output signal - sintaxis correcta de Angular 20
  sidebarStateChange = output<{ isExpanded: boolean; isMobile: boolean }>();

  // Configuración de elementos del sidebar
  sidebarItems = signal<SidebarItem[]>([
    {
      icon: `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4.5V19a1 1 0 0 0 1 1h15M7 14l4-4 4 4 5-5m0 0h-3.207M20 9v3.207"/>
      </svg>`,
      label: 'Métricas',
      route: '/start'
    },
    {
      icon: `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path fill-rule="evenodd" d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.82-3.096a5.51 5.51 0 0 0-2.797-6.293 3.5 3.5 0 1 1 2.796 6.292ZM19.5 18h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1a5.503 5.503 0 0 1-.471.762A5.998 5.998 0 0 1 19.5 18ZM4 7.5a3.5 3.5 0 0 1 5.477-2.889 5.5 5.5 0 0 0-2.796 6.293A3.501 3.501 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4 2 2 0 0 0 2 2h.5a5.998 5.998 0 0 1 3.071-5.238A5.505 5.505 0 0 1 7.1 12Z" clip-rule="evenodd"/>
      </svg>`,
      label: 'Clientes',
      route: '/client'
    },
    {
      icon: `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path fill-rule="evenodd" d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Zm-1 9a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2Zm2-5a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm4 4a1 1 0 1 0-2 0v3a1 1 0 1 0 2 0v-3Z" clip-rule="evenodd"/>
      </svg>`,
      label: 'Facturas',
      route: '/bill'
    },
    {
      icon: `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path fill-rule="evenodd" d="M8 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1h2a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2Zm6 1h-4v2H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2h-1V4Zm-3 8a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm-2-1a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H9Zm2 5a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm-2-1a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H9Z" clip-rule="evenodd"/>
      </svg>`,
      label: 'Lecturas',
      route: '/reading'
    },
    {
      icon: `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path fill-rule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H6Zm7.25-2.095c.478-.86.75-1.85.75-2.905a5.973 5.973 0 0 0-.75-2.906 4 4 0 1 1 0 5.811ZM15.466 20c.34-.588.535-1.271.535-2v-1a5.978 5.978 0 0 0-1.528-4H18a4 4 0 0 1 4 4v1a2 2 0 0 1-2 2h-4.535Z" clip-rule="evenodd"/>
      </svg>`,
      label: 'Empleados',
      route: '/employee'
    },
    {
      icon: `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 10c0-.55228-.4477-1-1-1h-3v2h3c.5523 0 1-.4477 1-1Z"/>
      <path d="M13 15v-2h2c1.6569 0 3-1.3431 3-3 0-1.65685-1.3431-3-3-3h-2.256c.1658-.46917.256-.97405.256-1.5 0-.51464-.0864-1.0091-.2454-1.46967C12.8331 4.01052 12.9153 4 13 4h7c.5523 0 1 .44772 1 1v9c0 .5523-.4477 1-1 1h-2.5l1.9231 4.6154c.2124.5098-.0287 1.0953-.5385 1.3077-.5098.2124-1.0953-.0287-1.3077-.5385L15.75 16l-1.827 4.3846c-.1825.438-.6403.6776-1.0889.6018.1075-.3089.1659-.6408.1659-.9864v-2.6002L14 15h-1ZM6 5.5C6 4.11929 7.11929 3 8.5 3S11 4.11929 11 5.5 9.88071 8 8.5 8 6 6.88071 6 5.5Z"/>
      <path d="M15 11h-4v9c0 .5523-.4477 1-1 1-.55228 0-1-.4477-1-1v-4H8v4c0 .5523-.44772 1-1 1s-1-.4477-1-1v-6.6973l-1.16797 1.752c-.30635.4595-.92722.5837-1.38675.2773-.45952-.3063-.5837-.9272-.27735-1.3867l2.99228-4.48843c.09402-.14507.2246-.26423.37869-.34445.11427-.05949.24148-.09755.3763-.10887.03364-.00289.06747-.00408.10134-.00355H15c.5523 0 1 .44772 1 1 0 .5523-.4477 1-1 1Z"/>
    </svg>`,
      label: 'Contadores',
      route: '/counter'
    },
    {
      icon: `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path fill="currentColor" d="M4 19v2c0 .5523.44772 1 1 1h14c.5523 0 1-.4477 1-1v-2H4Z"/>
      <path fill="currentColor" fill-rule="evenodd" d="M9 3c0-.55228.44772-1 1-1h8c.5523 0 1 .44772 1 1v3c0 .55228-.4477 1-1 1h-2v1h2c.5096 0 .9376.38314.9939.88957L19.8951 17H4.10498l.90116-8.11043C5.06241 8.38314 5.49047 8 6.00002 8H12V7h-2c-.55228 0-1-.44772-1-1V3Zm1.01 8H8.00002v2.01H10.01V11Zm.99 0h2.01v2.01H11V11Zm5.01 0H14v2.01h2.01V11Zm-8.00998 3H10.01v2.01H8.00002V14ZM13.01 14H11v2.01h2.01V14Zm.99 0h2.01v2.01H14V14ZM11 4h6v1h-6V4Z" clip-rule="evenodd"/>
    </svg>`,
      label: 'Empresas',
      route: '/enterprise'
    }
  ]);

  constructor(private sanitizer: DomSanitizer) {
    // Sanitiza los iconos al inicializar
    this.sanitizeIcons();
  }

  ngOnInit() {
    this.checkMobile();
    this.setupResizeListener();
    // Emitir estado inicial
    this.emitStateChange();
  }

  private checkMobile() {
    this.mobile.set(window.innerWidth < 1024);
    // En móvil, el sidebar inicia colapsado
    if (this.mobile()) {
      this.expanded.set(false);
    } else {
      // En desktop, puede iniciar expandido o colapsado según preferencia
      this.expanded.set(true);
    }
  }

  private setupResizeListener() {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(100),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        const wasMobile = this.mobile();
        this.checkMobile();

        // Si cambió de móvil a desktop o viceversa, ajustar estado
        if (wasMobile !== this.mobile()) {
          if (this.mobile()) {
            this.expanded.set(false);
          } else {
            this.expanded.set(true);
          }
          this.emitStateChange();
        }
      });
  }

  toggle() {
    this.expanded.update(expanded => !expanded);
    this.emitStateChange();
  }

  expand() {
    this.expanded.set(true);
    this.emitStateChange();
  }

  collapse() {
    this.expanded.set(false);
    this.emitStateChange();
  }

  private emitStateChange() {
    this.sidebarStateChange.emit({
      isExpanded: this.isExpanded(),
      isMobile: this.isMobile()
    });
  }

  isActiveRoute(route?: string): boolean {
    if (!route) return false;
    return this.router.url === route;
  }

  // Método para sanitizar los iconos
  private sanitizeIcons() {
    this.sidebarItems.update(items =>
      items.map(item => ({
        ...item,
        icon: typeof item.icon === 'string' && item.icon
          ? this.sanitizer.bypassSecurityTrustHtml(item.icon)
          : item.icon || ''
      }))
    );
  }
}
