import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import { authorizationInterceptor } from './interceptors/token-interceptor';
import { loaderInterceptor } from './interceptors/loader-interceptor';
import { errorInterceptor } from './interceptors/error-interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptors([ authorizationInterceptor, loaderInterceptor, errorInterceptor])
    ),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(
      withEventReplay(),
      withIncrementalHydration()
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: true, // Habilitado tanto en desarrollo como producción
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ]
};
