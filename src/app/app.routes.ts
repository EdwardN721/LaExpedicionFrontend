import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ─── Public routes ──────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },

  // ─── Admin routes (role: Admin) ──────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'Admin' },
    loadComponent: () =>
      import('./features/admin/admin-shell/admin-shell.component').then(
        (m) => m.AdminShellComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'items',
        loadComponent: () =>
          import('./features/admin/gestion-items/item-list.component').then(
            (m) => m.ItemListComponent
          ),
      },
      {
        path: 'expediciones',
        loadComponent: () =>
          import(
            './features/admin/gestion-expediciones/expedition-list.component'
          ).then((m) => m.ExpeditionListComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import(
            './features/admin/gestion-usuarios/user-list.component'
          ).then((m) => m.UserListComponent),
      },
    ],
  },

  // ─── Player routes (role: User) ─────────────────────────────────
  {
    path: 'play',
    canActivate: [authGuard],
    data: { role: 'User' },
    loadComponent: () =>
      import('./features/player/player-shell/player-shell.component').then(
        (m) => m.PlayerShellComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import(
            './features/player/personaje/personaje.component'
          ).then((m) => m.PersonajeComponent),
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./features/player/inventario/inventario.component').then(
            (m) => m.InventarioComponent
          ),
      },
      {
        path: 'mapa',
        loadComponent: () =>
          import(
            './features/player/mapa-expediciones/mapa-expediciones.component'
          ).then((m) => m.MapaExpedicionesComponent),
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('./features/player/historial/historial.component').then(
            (m) => m.HistorialComponent
          ),
      },
    ],
  },

  // ─── Fallback ─────────────────────────────────────────────────────
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
