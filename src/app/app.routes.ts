import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ─── Public routes ──────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then(
        (m) => m.RegisterComponent
      ),
  },

  // ─── Admin routes (role: Admin) ──────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'Admin' },
    loadComponent: () =>
      import('./features/admin/admin-shell/admin-shell').then(
        (m) => m.AdminShellComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'items',
        loadComponent: () =>
          import('./features/admin/gestion-items/item-list').then(
            (m) => m.ItemListComponent
          ),
      },
      {
        path: 'expediciones',
        loadComponent: () =>
          import(
            './features/admin/gestion-expediciones/expedition-list'
          ).then((m) => m.ExpeditionListComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import(
            './features/admin/gestion-usuarios/user-list'
          ).then((m) => m.UserListComponent),
      },
    ],
  },

 // ─── Player routes (role: User) ─────────────────────────────────
  {
    path: 'play',
    canActivate: [authGuard],
    // data: { role: 'User' }, <-- (Opcional: Si tu AuthGuard no revisa roles, puedes dejarla o quitarla)
    loadComponent: () =>
      import('./features/player/player-shell/player-shell').then(
        (m) => m.PlayerShellComponent
      ),
    children: [
      // 1. Redirigir por defecto a personaje si solo escriben "/play"
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'personaje'
      },
      // 2. La ruta exacta que busca el botón del menú
      {
        path: 'personaje',
        loadComponent: () =>
          import(
            './features/player/personaje/personaje'
          ).then((m) => m.PersonajeComponent),
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./features/player/inventario/inventario').then(
            (m) => m.InventarioComponent
          ),
      },
      {
        path: 'tienda',
        loadComponent: () => import('./features/player/tienda/tienda').then
        ((m) => m.Tienda),
      },
      {
        path: 'mapa',
        loadComponent: () =>
          import(
            './features/player/mapa-expediciones/mapa-expediciones'
          ).then((m) => m.MapaExpedicionesComponent),
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('./features/player/historial/historial').then(
            (m) => m.HistorialComponent
          ),
      },
    ],
  },

  // ─── Fallback ─────────────────────────────────────────────────────
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
