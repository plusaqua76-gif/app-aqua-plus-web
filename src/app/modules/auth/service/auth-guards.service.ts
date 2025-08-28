import { Injectable, signal } from '@angular/core';

export type Role = 'SUPER ADMIN' | 'ADMIN' | 'CLIENTE' | 'EMPLEADO' | 'EMPRESA' | 'FONTANERO';

@Injectable({ providedIn: 'root' })
export class AuthServiceGuard {

  private readonly roles = signal<Role[]>([]);
  rolesAuth = this.roles.asReadonly();

  setSession(user: { rolesAuth: Role[] }) {
    this.roles.set(user.rolesAuth ?? []);
  }

  hasAnyRole(allowed: Role[]) {
    const current = this.roles();
    return allowed.some(r => current.includes(r));
  }

  isLoggedIn() {
    return this.roles().length > 0;
  }
}
