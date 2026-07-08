import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { FlowbiteService } from './core/services/flowbite.service';
import { PreconnetManager } from './core/utils/preconnet';
import { Seo } from './core/utils/SEO';
import { isPlatformBrowser } from '@angular/common';
import { Toast } from '@shared/components/toast';
import { GlobalLoader } from '@components/global-loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, GlobalLoader],
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
  private readonly preconnetManager = inject(PreconnetManager);
  private readonly seoService = inject(Seo);

constructor() {

   this.preconnetManager.setDomainPreconnet();
   this.seoService.init();
}
  title = 'app-aqua-plus-web';

  private readonly currentRoute = signal('');
  private initFlowbite: (() => void) | null = null;


  shouldShowGlobalLoader = (): boolean => {
    const route = this.currentRoute();
    return !route.includes('/pagos/redirigir/') && !route.includes('/pagos/') && !route.includes('/pagos/transaccion') && !route.includes('/pagos/iniciar');
  };

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {
      this.preconnetManager.loadExternalScripts();

      this.flowbiteService.loadFlowbite((flowbite) => {
        this.initFlowbite = flowbite.initFlowbite;
        this.initFlowbite?.();
      });
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute.set(event.url);
          setTimeout(() => this.initFlowbite?.(), 100);
        }
      });
    }
  }
}
