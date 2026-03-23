import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token();

  // 1. Clonar y adjuntar el Token
  let clonedRequest = req;
  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. Manejar la respuesta
  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el backend nos da un 401 (No autorizado)
      if (error.status === 401) {
        console.error('El Token es inválido o expiró. Cerrando sesión...');
        authService.logout(); // Esto limpia el localStorage
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};