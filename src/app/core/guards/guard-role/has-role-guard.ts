import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn } from '@angular/router';

export type Role = 'SUPER ADMIN' | 'ADMIN' | 'CLIENTE' | 'EMPLEADO';

export const hasRoleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return (route, state) => {
    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);

    if (!isBrowser) return false;

    const userDataString = sessionStorage.getItem('userData');
    if (!userDataString) return false;

    const userData = JSON.parse(userDataString);
    const userRole = userData.rol;

    if (!userRole) return false;

    return allowedRoles.includes(userRole);
  };
};
