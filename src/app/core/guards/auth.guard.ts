import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional route guard.
 *
 * Usage in routes:
 *   { path: 'admin', canActivate: [authGuard], data: { role: 'Admin' }, ... }
 *
 * - Redirects to /login if not authenticated.
 * - Redirects to /login if the required role doesn't match.
 */
export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const requiredRole = route.data?.['role'] as string | undefined;

  if (requiredRole && auth.userRole() !== requiredRole) {
    // Wrong role – redirect to the correct home for their actual role
    const actualRole = auth.userRole();
    if (actualRole === 'Admin') return router.createUrlTree(['/admin']);
    if (actualRole === 'User') return router.createUrlTree(['/play']);
    return router.createUrlTree(['/login']);
  }

  return true;
};
