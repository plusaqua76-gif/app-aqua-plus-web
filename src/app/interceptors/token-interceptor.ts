import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export function authorizationInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  if (!isBrowser) {
    return next(req);
  }

  const token = sessionStorage.getItem('authToken');

  if (!token) return next(req);

  const value = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  const authReq = req.clone({
    setHeaders: { Authorization: value }
  });
  return next(authReq);
}
