import { Directive, inject, TemplateRef, ViewContainerRef, input, effect, PLATFORM_ID } from '@angular/core';
import { Role } from '../guards/guard-role/has-role-guard';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[hasRole]'
})
export class HasRoleDirective {

  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);
  private platformId = inject(PLATFORM_ID);

  roles = input.required<Role[]>({
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

  private hasPermission(allowedRoles: Role[]): boolean {
    const isBrowser = isPlatformBrowser(this.platformId);

    if (!isBrowser) return false;

    const userDataString = sessionStorage.getItem('userData');
    if (!userDataString) return false;

    try {
      const userData = JSON.parse(userDataString);
      const userRole = userData.rol;

      if (!userRole) return false;

      const hasAccess = allowedRoles.includes(userRole);

      return hasAccess;
    } catch (error) {
      return false;
    }
  }
}
