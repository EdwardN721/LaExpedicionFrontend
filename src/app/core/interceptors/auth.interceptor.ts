import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Functional HTTP interceptor that attaches the JWT token
 * to every outgoing request as "Authorization: Bearer <token>".
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  if (token) {
    const cloned = req.clone({
      setHeaders: { 
        Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }

  return next(req);
};
