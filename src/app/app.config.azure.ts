import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import { authorizationInterceptor } from './interceptors/token-interceptor';
import { loaderInterceptor } from './interceptors/loader-interceptor';
import { errorInterceptor } from './interceptors/error-interceptor';

/**
 * Configuración específica para Azure Static Web Apps
 * SIN provideClientHydration para evitar conflictos con sessionStorage
 * Esta configuración asegura que la app funcione como SPA pura en Azure
 */
export const appConfigAzure: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptors([ authorizationInterceptor, loaderInterceptor, errorInterceptor])
    ),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    // NO incluimos provideClientHydration para Azure
    // Esto evita problemas con sessionStorage durante el SSR/prerendering
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ]
};
