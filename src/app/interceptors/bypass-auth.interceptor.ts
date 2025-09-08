import { HttpInterceptorFn } from '@angular/common/http';
/**
 * Interceptor que permite saltarse la autenticación para rutas específicas
 */
export const bypassAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const bypassUrls = [
    '/update-password',
  ];
  const shouldBypass = bypassUrls.some(url => req.url.includes(url));
  if (shouldBypass) {
    return next(req);
  }
  return next(req);
};
