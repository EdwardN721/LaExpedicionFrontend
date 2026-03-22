import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface AdminStats {
  totalUsers: number;
  totalItems: number;
  totalExpeditions: number;
  activeAdventures: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="font-rpg text-2xl text-rpg-text mb-1">Dashboard</h2>
      <p class="text-rpg-muted text-sm mb-8">Resumen general del reino</p>

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (i of [1,2,3,4]; track i) {
            <div class="rpg-card animate-pulse">
              <div class="h-4 bg-rpg-border rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-rpg-border rounded w-1/3"></div>
            </div>
          }
        </div>
      } @else if (stats()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div class="rpg-card">
            <p class="text-rpg-muted text-xs uppercase tracking-wider mb-1">Usuarios</p>
            <p class="text-3xl font-bold text-rpg-gold font-rpg">{{ stats()!.totalUsers }}</p>
          </div>
          <div class="rpg-card">
            <p class="text-rpg-muted text-xs uppercase tracking-wider mb-1">Items</p>
            <p class="text-3xl font-bold text-rpg-gold font-rpg">{{ stats()!.totalItems }}</p>
          </div>
          <div class="rpg-card">
            <p class="text-rpg-muted text-xs uppercase tracking-wider mb-1">Expediciones</p>
            <p class="text-3xl font-bold text-rpg-gold font-rpg">{{ stats()!.totalExpeditions }}</p>
          </div>
          <div class="rpg-card">
            <p class="text-rpg-muted text-xs uppercase tracking-wider mb-1">Aventuras activas</p>
            <p class="text-3xl font-bold text-rpg-success font-rpg">{{ stats()!.activeAdventures }}</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly loading = signal(true);
  readonly stats = signal<AdminStats | null>(null);

  ngOnInit(): void {
    // Replace with your actual stats endpoint
    this.http
      .get<AdminStats>(`${environment.apiUrl}/api/admin/stats`)
      .subscribe({
        next: (data) => {
          this.stats.set(data);
          this.loading.set(false);
        },
        error: () => {
          // Fallback mock while backend isn't connected
          this.stats.set({ totalUsers: 0, totalItems: 0, totalExpeditions: 0, activeAdventures: 0 });
          this.loading.set(false);
        },
      });
  }
}
