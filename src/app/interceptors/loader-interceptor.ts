import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoaderService } from '../shared/services/loader.service';

/**
 * Interceptor que muestra/oculta el loader automáticamente en peticiones HTTP
 * Para excluir una petición del loader, añadir el header 'X-Skip-Loader': 'true'
 */
export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  const skipLoader = req.headers.get('X-Skip-Loader') === 'true';
  if (skipLoader) {
    const cleanReq = req.clone({
      headers: req.headers.delete('X-Skip-Loader').delete('X-Request-Timeout')
    });
    return next(cleanReq);
  }
  const cleanReq = req.clone({
    headers: req.headers.delete('X-Skip-Loader').delete('X-Request-Timeout')
  });
  loaderService.show('Cargando...');

  return next(cleanReq).pipe(
    catchError((error) => {
      console.error('HTTP Error:', error);
      return throwError(() => error);
    }),
    finalize(() => {
      loaderService.hide();
    })
  );
};
