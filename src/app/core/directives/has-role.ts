import { Directive, inject, TemplateRef, ViewContainerRef, input, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[hasRole]'
})
export class HasRoleDirective {

  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly platformId = inject(PLATFORM_ID);

  roles = input.required<string[]>({
    alias: 'hasRole'
  });

  constructor() {
    effect(() => {
      const allowedRoles = this.roles();
      if (this.hasPermission(allowedRoles)) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainerRef.clear();
      }
    });
  }

  private hasPermission(allowedRoles: string[]): boolean {
    const isBrowser = isPlatformBrowser(this.platformId);

    if (!isBrowser) return false;

    const userDataString = sessionStorage.getItem('userData');
    if (!userDataString) return false;

    try {
      const userData = JSON.parse(userDataString);
      const userRole = userData.rol;

      if (!userRole) return false;

      // Comparación case-insensitive (ignorando mayúsculas/minúsculas)
      const userRoleUpper = userRole.toUpperCase();
      const allowedRolesUpper = allowedRoles.map(role => role.toUpperCase());
      const hasAccess = allowedRolesUpper.includes(userRoleUpper);

      return hasAccess;
    } catch (error) {
      console.error('Error parsing user data from sessionStorage:', error);
      return false;
    }
  }
}
