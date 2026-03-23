import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificamos si el usuario está autenticado
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  // 2. Verificamos si la ruta requiere un rol específico
  const requiredRole = route.data['role'] as string | undefined;
  
  if (requiredRole) {
    const userRole = authService.userRole();
    if (userRole !== requiredRole) {
      // Si un Usuario normal intenta entrar a Admin, lo mandamos a su panel
      return userRole === 'Admin' ? router.createUrlTree(['/admin']) : router.createUrlTree(['/play']);
    }
  }

  // Si pasa todo, le damos acceso
  return true;
};