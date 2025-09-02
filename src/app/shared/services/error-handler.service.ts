import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoaderService } from './loader.service';

export interface ErrorHandlerOptions {
  showLoader?: boolean;
  customMessage?: string;
  logError?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly loaderService = inject(LoaderService);

  /**
   * Maneja errores HTTP de manera centralizada
   * @param operation - Nombre de la operación que falló
   * @param options - Opciones de manejo de errores
   */
  handleError<T>(operation = 'operation', options: ErrorHandlerOptions = {}) {
    const defaultOptions: ErrorHandlerOptions = {
      showLoader: true,
      logError: true,
      ...options
    };

    return (error: HttpErrorResponse): Observable<T> => {
      // CRÍTICO: Siempre ocultar loader en caso de error
      // Esto asegura que el loader nunca se quede cargando infinitamente
      this.loaderService.hide();

      // Log del error si está habilitado
      if (defaultOptions.logError) {
        console.error(`${operation} failed:`, {
          operation,
          error: error.error,
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          timestamp: new Date().toISOString()
        });
      }

      // Usar mensaje personalizado o extraer del error
      const userMessage = defaultOptions.customMessage ||
                         error.error?.userMessage ||
                         error.error?.message ||
                         `Error en ${operation}`;

      // Crear error enriquecido para el componente
      const enrichedError = {
        ...error,
        operation,
        userMessage,
        timestamp: new Date().toISOString()
      };

      return throwError(() => enrichedError);
    };
  }

  /**
   * Extrae el mensaje de error más apropiado para mostrar al usuario
   */
  extractErrorMessage(error: any): string {
    if (error?.userMessage) {
      return error.userMessage;
    }

    if (error?.error?.userMessage) {
      return error.error.userMessage;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    return 'Ha ocurrido un error inesperado';
  }

  /**
   * Determina si un error es recuperable (temporal)
   */
  isRecoverableError(error: HttpErrorResponse): boolean {
    const recoverableStatuses = [408, 429, 500, 502, 503, 504];
    return recoverableStatuses.includes(error.status) || error.status === 0;
  }

  /**
   * Obtiene sugerencias de acción basadas en el tipo de error
   */
  getErrorActionSuggestion(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Verifica tu conexión a internet e intenta nuevamente.';
      case 401:
        return 'Por favor, inicia sesión nuevamente.';
      case 403:
        return 'Contacta al administrador si necesitas acceso.';
      case 404:
        return 'Verifica que el recurso solicitado existe.';
      case 408:
      case 429:
        return 'Espera unos momentos e intenta nuevamente.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'El problema es temporal. Intenta más tarde.';
      default:
        return 'Si el problema persiste, contacta al soporte técnico.';
    }
  }
}
