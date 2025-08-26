import { HttpRequest, HttpHandlerFn } from '@angular/common/http';

export function authorizationInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const token = sessionStorage.getItem('authToken');

  if (!token) return next(req);

  const value = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  const authReq = req.clone({
    setHeaders: { Authorization: value }
  });
  return next(authReq);
}
