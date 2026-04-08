import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  // Si tiene el gafete de Admin, lo dejamos pasar a la vista
  if (authService.isAdmin) {
    return true;
  }

  // Si es un simple mortal, lo regresamos al juego
  toast.error('Acceso denegado. No tienes nivel de Administrador.');
  router.navigate(['/play/mapa']);
  return false;
};
