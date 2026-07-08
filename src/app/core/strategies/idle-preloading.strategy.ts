import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * Estrategia de precarga que carga los chunks de rutas lazy en segundo plano
 * cuando el navegador está inactivo (requestIdleCallback), sin competir con la
 * carga inicial de la aplicación.
 *
 * - SSR-safe: en servidor NO precarga nada (evita descargar chunks innecesarios).
 * - Respeta `data.preload === false` para excluir rutas puntuales.
 * - Fallback a timer() cuando requestIdleCallback no está disponible.
 */
@Injectable({ providedIn: 'root' })
export class IdlePreloadingStrategy implements PreloadingStrategy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (!this.isBrowser || route.data?.['preload'] === false) {
      return of(null);
    }

    return this.whenIdle().pipe(mergeMap(() => load()));
  }

  private whenIdle(): Observable<void> {
    const ric = (window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    }).requestIdleCallback;

    if (typeof ric === 'function') {
      return new Observable<void>((subscriber) => {
        const id = ric(() => {
          subscriber.next();
          subscriber.complete();
        }, { timeout: 3000 });

        return () => {
          const cancel = (window as unknown as {
            cancelIdleCallback?: (handle: number) => void;
          }).cancelIdleCallback;
          cancel?.(id);
        };
      });
    }

    return timer(1500).pipe(mergeMap(() => of(void 0)));
  }
}
