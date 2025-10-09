import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn } from '@angular/router';

export const hasRoleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);

    if (!isBrowser) return false;

    const userDataString = sessionStorage.getItem('userData');
    if (!userDataString) return false;

    const userData = JSON.parse(userDataString);
    const userRole = userData.rol;

    if (!userRole) return false;

    // Comparación case-insensitive (ignorando mayúsculas/minúsculas)
    const userRoleUpper = userRole.toUpperCase();
    const allowedRolesUpper = allowedRoles.map(role => role.toUpperCase());

    return allowedRolesUpper.includes(userRoleUpper);
  };
};
