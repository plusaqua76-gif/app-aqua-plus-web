import { inject, PLATFORM_ID } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanMatchFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  const hasUser = isBrowser && !!sessionStorage.getItem('userData');
  return hasUser ? true : router.createUrlTree(['/auth/login']);
};
