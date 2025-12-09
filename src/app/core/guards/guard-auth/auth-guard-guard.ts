import { inject, PLATFORM_ID } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/**
 * Guard de autenticación compatible con SSR
 * En el servidor permite el acceso (para que renderice la ruta)
 * En el navegador verifica sessionStorage
 */
export const authGuard: CanMatchFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // En SSR, permitir acceso para que renderice la página
  // El navegador hará la verificación real
  if (!isBrowser) {
    return true;
  }

  // En el navegador, verificar si hay usuario en storage
  const hasUser = !!sessionStorage.getItem('userData');
  return hasUser ? true : router.createUrlTree(['/auth/login']);
};
