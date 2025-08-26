import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { authGuard } from './auth-guard-guard';

describe('authGuardGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
