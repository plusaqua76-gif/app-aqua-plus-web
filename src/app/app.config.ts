import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { IdlePreloadingStrategy } from './core/strategies/idle-preloading.strategy';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs);

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { authorizationInterceptor } from './interceptors/token-interceptor';
import { loaderInterceptor }        from './interceptors/loader-interceptor';
import { errorInterceptor }         from './interceptors/error-interceptor';
import { securityInterceptor }      from './interceptors/security-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    provideAnimations(),

    provideHttpClient(
      withFetch(),
      withInterceptors([authorizationInterceptor, securityInterceptor, loaderInterceptor, errorInterceptor])
    ),

    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      routes,
      withComponentInputBinding(),
      withPreloading(IdlePreloadingStrategy)
    ),

    provideClientHydration(
      withIncrementalHydration(),
      withEventReplay()
    )
  ]
};
