import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoaderService } from '../shared/services/loader.service';

/**
 * Interceptor que muestra/oculta el loader automáticamente en peticiones HTTP
 * Para excluir una petición del loader, añadir el header 'X-Skip-Loader': 'true'
 * Para personalizar el timeout, añadir el header 'X-Request-Timeout': 'milliseconds'
 */
export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  const skipLoader = req.headers.get('X-Skip-Loader') === 'true';

  if (skipLoader) {
    const cleanReq = req.clone({
      headers: req.headers.delete('X-Skip-Loader')
    });
    return next(cleanReq);
  }

  const timeoutMs = parseInt(req.headers.get('X-Request-Timeout') || '10000');
  loaderService.show('Cargando...');

  return next(req).pipe(
    timeout(timeoutMs),
    catchError((error) => {
      loaderService.hide();

      if (error.name === 'TimeoutError') {
        console.error(`Request timeout after ${timeoutMs}ms for URL: ${req.url}`);
        const timeoutError = new Error(`La petición ha excedido el tiempo límite de ${timeoutMs/1000} segundos`);
        timeoutError.name = 'TimeoutError';
        return throwError(() => timeoutError);
      }

      return throwError(() => error);
    }),
    finalize(() => {
      loaderService.hide();
    })
  );
};
