import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      console.error('HTTP Error intercepted:', {
        url: req.url,
        method: req.method,
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        error: error.error
      });

      let errorMessage = 'Ha ocurrido un error inesperado';

      if (error.status === 0) {
        console.error('Network Error:', 'Sin conexión');
        errorMessage = 'Sin conexión a internet. Verifica tu conexión.';
      } else if (error.status === 400) {
        console.error('Bad Request:', error.error?.message || errorMessage);
        // Para errores 400, priorizar el mensaje del servidor
        errorMessage = error.error?.message || error.error?.msg || 'Error de solicitud. Verifica los datos enviados.';
      } else if (error.status === 401) {
        console.error('Unauthorized:', error.error?.message || errorMessage);
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error.status === 403) {
        console.error('Forbidden:', error.error?.message || errorMessage);
        errorMessage = 'No tienes permisos para realizar esta acción.';
      } else if (error.status === 404) {
        console.error('Not Found:', error.error?.message || errorMessage);
        errorMessage = error.error?.message || 'Recurso no encontrado.';
      } else if (error.status === 408) {
        console.error('Request Timeout:', error.error?.message || errorMessage);
        errorMessage = 'Tiempo de espera agotado. Intenta nuevamente.';
      } else if (error.status === 422) {
        console.error('Unprocessable Entity:', error.error?.message || errorMessage);
        errorMessage = error.error?.message || 'Error de validación en los datos.';
      } else if (error.status >= 500) {
        console.error('Server Error:', error.error?.message || errorMessage);
        errorMessage = 'Ha ocurrido un error interno del servidor. Por favor, intenta más tarde.';
      } else {
        console.error('Error:', error.error?.message || errorMessage);
        errorMessage = error.error?.message || errorMessage;
      }

      // Crear un error personalizado que preserve el error original
      const customError = {
        ...error.error,
        userMessage: errorMessage,
        originalError: error.error,
        timestamp: new Date().toISOString(),
        requestInfo: {
          url: req.url,
          method: req.method
        },
        httpStatus: error.status,
        httpStatusText: error.statusText
      };

      // Retornar el error original pero con información adicional
      const modifiedError = new HttpErrorResponse({
        error: customError,
        headers: error.headers,
        status: error.status,
        statusText: error.statusText,
        url: error.url || undefined
      });

      return throwError(() => modifiedError);
    })
  );
};
