import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/**
 * Guard que redirige automáticamente según el rol del usuario para las rutas PQR
 * - ADMIN: Permite acceso a la ruta actual (pqr-secretary)
 * - CLIENTE: Redirige automáticamente a pqr-enterprice-clients
 */
export const pqrRoleRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  if (!isBrowser) return false;

  const userDataString = sessionStorage.getItem('userData');
  if (!userDataString) return false;

  try {
    const userData = JSON.parse(userDataString);
    const userRole = userData.rol;
    if (userRole === 'CLIENTE') {
      router.navigate(['/shell/pqr-client/pqr-enterprice-clients']);
      return false;
    }

    if (userRole === 'ADMIN') {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error parsing userData in pqrRoleRedirectGuard:', error);
    return false;
  }
};
