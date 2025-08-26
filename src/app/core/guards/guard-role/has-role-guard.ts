import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn } from '@angular/router';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'CLIENTE' | 'EMPLEADO' | 'EMPRESA' | 'FONTANERO';

export const ROLE_ID_TO_CODE: Record<number, Role> = {
  11: 'SUPER_ADMIN', // codemaker, aqua plus
  12: 'EMPLEADO', // empleado de la empresa de acuedusto (secretaria o fontanero)
  13: 'CLIENTE', // cliente de la empresa de acuedusto (usuario que consume el servicio del acuedusto)
   9: 'EMPRESA', // eliminar 
  10: 'ADMIN', // dueño del acueducto
  14: 'FONTANERO', // eliminar
} as const;

export const hasRoleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return (route, state) => {
    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);

    if (!isBrowser) return false;

    const userDataString = sessionStorage.getItem('userData');
    if (!userDataString) return false;

    const userData = JSON.parse(userDataString);
    const userRoleId = userData.rolId;

    if (!userRoleId || !ROLE_ID_TO_CODE[userRoleId]) return false;

    const userRole = ROLE_ID_TO_CODE[userRoleId];

    return allowedRoles.includes(userRole);
  };
};
