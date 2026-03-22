# La Expedición — Angular v21 Frontend Architecture

## Folder Structure

```
src/
├── app/
│   ├── app.component.ts          ← Root (RouterOutlet + ToastContainer)
│   ├── app.config.ts             ← ApplicationConfig (providers)
│   ├── app.routes.ts             ← Lazy-loaded routes
│   │
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts     ← CanActivateFn (role-aware)
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts ← HttpInterceptorFn (Bearer JWT)
│   │   ├── models/
│   │   │   ├── auth.models.ts
│   │   │   ├── expedition.models.ts
│   │   │   ├── item.models.ts
│   │   │   ├── player.models.ts
│   │   │   └── user.models.ts
│   │   └── services/
│   │       ├── auth.service.ts         ← Signals state (token, user, role)
│   │       ├── expedition.service.ts   ← CRUD + pagination
│   │       ├── item.service.ts         ← CRUD + pagination (X-Pagination header)
│   │       └── player.service.ts       ← Personaje, Inventario, Aventuras
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/login.component.ts
│   │   │   └── register/register.component.ts
│   │   ├── admin/
│   │   │   ├── admin-shell/admin-shell.component.ts
│   │   │   ├── dashboard/admin-dashboard.component.ts
│   │   │   ├── gestion-items/item-list.component.ts       ← Full CRUD + dynamic stat modifiers
│   │   │   ├── gestion-expediciones/expedition-list.component.ts
│   │   │   └── gestion-usuarios/user-list.component.ts
│   │   └── player/
│   │       ├── player-shell/player-shell.component.ts
│   │       ├── personaje/personaje.component.ts           ← Create / show character + XP bar
│   │       ├── inventario/inventario.component.ts         ← Grid + durability bars + equip/drop
│   │       ├── mapa-expediciones/mapa-expediciones.component.ts
│   │       └── historial/historial.component.ts
│   │
│   └── shared/
│       ├── services/
│       │   └── toast.service.ts                          ← Signal-based toast queue
│       └── components/
│           └── toast-container/toast-container.component.ts
│
├── environments/
│   ├── environment.ts            ← apiUrl: 'https://localhost:7001'
│   └── environment.prod.ts
├── main.ts
└── styles.css                    ← Tailwind + RPG design tokens
```

## Key Design Decisions

### State Management (Signals)
`AuthService` uses Angular 21 Signals — no NgRx needed.
- `token` signal → `currentUser` computed → `isAuthenticated` / `userRole` computed
- Components call `auth.isAuthenticated()` / `auth.userRole()` directly

### JWT Flow
1. `AuthService.login()` stores token in localStorage, updates `_token` signal.
2. `authInterceptor` (functional) reads `auth.token()` and attaches `Authorization: Bearer`.
3. `authGuard` (functional) checks `isAuthenticated()` + `data.role`.

### Pagination
All paginated endpoints follow the pattern:
- Send `pageNumber` + `pageSize` query params.
- Read `X-Pagination` response header → parse as `PaginationMeta`.
- `ItemService.getAll()` is the reference implementation.

### RPG Theme
All Tailwind colors are custom tokens defined in `tailwind.config.js`:
- `rpg-bg`, `rpg-card`, `rpg-border`, `rpg-gold`, `rpg-success`, `rpg-danger`, `rpg-text`, `rpg-muted`
- Utility classes in `styles.css`: `.btn-primary`, `.rpg-card`, `.rpg-input`, `.rpg-table`, `.badge-*`

## Quick Start

```bash
npm install -g @angular/cli
ng new la-expedicion --no-create-application
cd la-expedicion

# Copy all src/ files into the project
npm install

# Update src/environments/environment.ts with your .NET 8 API URL
ng serve
```
