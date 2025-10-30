import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  Injector,
} from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { FlowbiteService } from './core/services/flowbite.service';
import { initFlowbite } from 'flowbite';
import { isPlatformBrowser, JsonPipe } from '@angular/common';
import { SwPush } from '@angular/service-worker';
import { NotificationsService } from '@services/notifications.service';
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

  <!-- <button (click)="subscribeToNotifications()">
  Solicitar persmisos
  </button>

  <div>
    <code>{{ respuesta | json }}</code>
  </div> -->
  `,
})
export class App implements OnInit {
  private readonly flowbiteService = inject(FlowbiteService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  private readonly notificationsService = inject(NotificationsService);

  title = 'app-aqua-plus-web';

  public readonly VAPID_PUBLIC_KEY =
    'BISU0QyUjxCRXkV_LfiBdQN8Rsi2dsNQ5xEtbSXX60O9B1R5Txt0P5pdtg4yxQvuB89PDDkodn-MxqUZYnw6YIM';
  private swPush: SwPush | null = null;

  respuesta: any;
  err: any;

  subscribeToNotifications(): void {
    this.swPush
      ?.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      })
      .then((sub) => {
        const token = JSON.parse(JSON.stringify(sub));
        console.log('Token de suscripción:', token);

        this.notificationsService.saveToken(token).subscribe({
          next: (res: Object) => {
            console.log('Token guardado exitosamente:', res);
          },
          error: (error: any) => {
            console.error('Error al guardar el token:', error);
          },
        });
      })
      .catch((err) => {
        console.error('Error al suscribirse a las notificaciones:', err);
      });
  }

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
      // Solo inyectar SwPush en el navegador usando el injector con manejo de errores
      this.subscribeToNotifications();
      try {
        this.swPush = this.injector.get(SwPush, null);
      } catch (error) {
        console.warn('SwPush no está disponible:', error);
        this.swPush = null;
      }

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
