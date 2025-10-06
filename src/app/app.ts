import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import {
  RouterOutlet,
  RouterModule,
  Router,
  NavigationEnd,
} from '@angular/router';
import { FlowbiteService } from './core/services/flowbite.service';
import { initFlowbite } from 'flowbite';
import { Toast } from '@shared/components/toast';
import { GlobalLoader } from './core/components/global-loader';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, Toast, GlobalLoader],
  template: `
    <router-outlet></router-outlet>
    <app-toast></app-toast>
    @if (shouldShowGlobalLoader()) {
      <app-global-loader></app-global-loader>
    }
  `,
})
export class App implements OnInit {


  private readonly flowbiteService = inject(FlowbiteService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  title = 'app-aqua-plus-web';

  // Signal para trackear si estamos en una ruta que no debe mostrar el loader global
  private readonly currentRoute = signal('');

  // Computed para determinar si mostrar el loader global
  shouldShowGlobalLoader = (): boolean => {
    const route = this.currentRoute();
    // No mostrar loader global en print-bill
    return !route.includes('/print-bill');
  };

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.flowbiteService.loadFlowbite((flowbite) => {
        initFlowbite();
      });

      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          // Actualizar la ruta actual
          this.currentRoute.set(event.url);
          setTimeout(() => initFlowbite(), 100);
        }
      });
    }
  }
}
