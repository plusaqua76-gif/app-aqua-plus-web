import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { authorizationInterceptor } from './interceptors/token-interceptor';
import { loaderInterceptor } from './interceptors/loader-interceptor';
import { errorInterceptor } from './interceptors/error-interceptor';

import { AppConfigService } from './config/app-config.service';

export function initializeApp(configService: AppConfigService) {
  return () => configService.getConfig();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),

    provideHttpClient(
      withFetch(),
      withInterceptors([authorizationInterceptor, loaderInterceptor, errorInterceptor])
    ),

    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(routes, withComponentInputBinding()),

    provideClientHydration(
      withIncrementalHydration(),
      withEventReplay()
    ),

    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfigService],
      multi: true
    }
  ]
};