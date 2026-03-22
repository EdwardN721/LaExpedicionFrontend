import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-player-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen bg-rpg-bg">
      <!-- Sidebar -->
      <aside class="w-60 bg-rpg-card border-r border-rpg-border flex flex-col shrink-0">
        <div class="p-6 border-b border-rpg-border">
          <h1 class="font-rpg text-xl text-rpg-gold tracking-wide">La Expedición</h1>
          <p class="text-rpg-muted text-xs mt-1">Portal del Aventurero</p>
        </div>

        <nav class="flex-1 p-4 space-y-1">
          <a routerLink="/play"
             routerLinkActive="bg-rpg-gold/10 text-rpg-gold border-rpg-gold"
             [routerLinkActiveOptions]="{ exact: true }"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-rpg-text
                    hover:bg-rpg-border/40 border border-transparent transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mi Personaje
          </a>

          <a routerLink="/play/inventario"
             routerLinkActive="bg-rpg-gold/10 text-rpg-gold border-rpg-gold"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-rpg-text
                    hover:bg-rpg-border/40 border border-transparent transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
            Inventario
          </a>

          <a routerLink="/play/mapa"
             routerLinkActive="bg-rpg-gold/10 text-rpg-gold border-rpg-gold"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-rpg-text
                    hover:bg-rpg-border/40 border border-transparent transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Mapa de Expediciones
          </a>

          <a routerLink="/play/historial"
             routerLinkActive="bg-rpg-gold/10 text-rpg-gold border-rpg-gold"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-rpg-text
                    hover:bg-rpg-border/40 border border-transparent transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Historial de Aventuras
          </a>
        </nav>

        <div class="p-4 border-t border-rpg-border">
          <div class="flex items-center justify-between">
            <span class="text-rpg-muted text-sm truncate">{{ auth.userName() }}</span>
            <button (click)="auth.logout()"
                    class="text-rpg-danger hover:opacity-70 text-sm transition">
              Salir
            </button>
          </div>
        </div>
      </aside>

      <main class="flex-1 p-8 overflow-auto">
        <router-outlet />
      </main>
    </div>
  `,
})
export class PlayerShellComponent {
  readonly auth = inject(AuthService);
}
