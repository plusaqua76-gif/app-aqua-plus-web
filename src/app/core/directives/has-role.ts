import { Directive, inject, TemplateRef, ViewContainerRef, input } from '@angular/core';
import { Role } from '../guards/guard-role/has-role-guard';

@Directive({
  selector: '[hasRole]'
})
export class HasRoleDirective {

  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef)

  roles =  input.required<Role[]>({
    alias: 'hasRole'
  });
}
