import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
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
    <app-global-loader></app-global-loader>
  `,
})
export class App implements OnInit {


  private readonly flowbiteService = inject(FlowbiteService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  title = 'app-aqua-plus-web';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.flowbiteService.loadFlowbite((flowbite) => {
        initFlowbite();
      });

      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          setTimeout(() => initFlowbite(), 100);
        }
      });
    }
  }
}
