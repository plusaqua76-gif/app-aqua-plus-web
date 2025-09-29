import { Injectable, inject } from '@angular/core';
import { LoaderService } from './loader.service';
import { Observable, finalize, tap, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderHelperService {
  private readonly loaderService = inject(LoaderService);

  /**
   * Wrapper para observables que maneja el loader automáticamente
   * @param source$ Observable a ejecutar
   * @param message Mensaje opcional
   * @returns Observable con el loader manejado automáticamente
   */
  withLoader<T>(source$: Observable<T>, message?: string): Observable<T> {
    this.loaderService.show(message);

    return source$.pipe(
      catchError((error) => {
        console.error('Error en petición:', error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.loaderService.hide();
      })
    );
  }

  /**
   * Para casos donde necesites mostrar el loader manualmente
   * pero quieras asegurar que se oculte después de un tiempo
   * @param message Mensaje opcional
   * @param maxTime Tiempo máximo en ms (opcional)
   */
  showWithTimeout(message?: string, maxTime?: number): void {
    this.loaderService.show(message);

    if (maxTime) {
      setTimeout(() => {
        this.loaderService.hide();
      }, maxTime);
    }
  }

}
