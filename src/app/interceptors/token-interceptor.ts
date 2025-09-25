import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { AuthUserService } from '../modules/auth/service/authUser.service';
import { Router } from '@angular/router';

export function authorizationInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  const authService = inject(AuthUserService);
  const router = inject(Router);

  if (!isBrowser) {
    return next(req);
  }

  // Si la request ya tiene Authorization header, continuar
  if (req.headers.has('Authorization')) {
    return next(req);
  }

  // Rutas excluidas que no necesitan token
  const excludedPaths = ['/update-password', '/reset-password', '/activate-account', '/auth'];
  const isExcludedPath = excludedPaths.some(path => req.url.includes(path));

  if (isExcludedPath) {
    return next(req);
  }

  const token = authService.getAuthToken();

  // Si no hay token, continuar sin agregar header
  if (!token) {
    return next(req);
  }

  // Verificar si el token está expirado
  if (authService.isTokenExpired(token)) {
    authService.clearTokens();
    router.navigate(['/auth/login']);
    return throwError(() => new Error('Token expired'));
  }

  // Agregar token a la request
  const value = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  const authReq = req.clone({
    setHeaders: { Authorization: value }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es error 401 o 403, limpiar sesión y redirigir al login
      if (error.status === 401 || error.status === 403) {
        authService.clearTokens();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
}
