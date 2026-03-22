import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastService } from '../../../shared/services/toast.service';
import { AppUser } from '../../../core/models/user.models';
import { PaginationMeta } from '../../../core/models/item.models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="mb-6">
        <h2 class="font-rpg text-2xl text-rpg-text">Gestión de Usuarios</h2>
        <p class="text-rpg-muted text-sm mt-0.5">
          {{ pagination()?.totalCount ?? 0 }} aventureros registrados
        </p>
      </div>

      @if (loading()) {
        <div class="rpg-card animate-pulse space-y-3">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="h-10 bg-rpg-border/40 rounded"></div>
          }
        </div>
      } @else {
        <div class="rpg-card overflow-x-auto p-0">
          <table class="rpg-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Registrado</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user.id) {
                <tr>
                  <td class="font-medium text-rpg-text">{{ user.userName }}</td>
                  <td class="text-rpg-muted">{{ user.email }}</td>
                  <td>
                    <span [class]="user.role === 'Admin' ? 'badge-danger' : 'badge-gold'">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="text-rpg-muted text-sm">
                    {{ user.createdAt | date:'dd/MM/yyyy' }}
                  </td>
                  <td class="text-right">
                    <button
                      class="text-rpg-gold hover:underline text-sm"
                      (click)="toggleRole(user)"
                    >
                      {{ user.role === 'Admin' ? 'Quitar Admin' : 'Hacer Admin' }}
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="text-center text-rpg-muted py-10">
                    No hay usuarios registrados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (pagination(); as pg) {
          <div class="flex items-center justify-between mt-4 text-sm text-rpg-muted">
            <span>Página {{ pg.currentPage }} de {{ pg.totalPages }}</span>
            <div class="flex gap-2">
              <button class="btn-secondary py-1.5 px-3 text-xs"
                      [disabled]="!pg.hasPrevious"
                      (click)="changePage(pg.currentPage - 1)">Anterior</button>
              <button class="btn-secondary py-1.5 px-3 text-xs"
                      [disabled]="!pg.hasNext"
                      (click)="changePage(pg.currentPage + 1)">Siguiente</button>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class UserListComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly users = signal<AppUser[]>([]);
  readonly pagination = signal<PaginationMeta | null>(null);
  readonly currentPage = signal(1);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    const params = new HttpParams()
      .set('pageNumber', this.currentPage())
      .set('pageSize', 15);

    this.http
      .get<AppUser[]>(`${environment.apiUrl}/api/admin/users`, { params, observe: 'response' })
      .subscribe({
        next: (res) => {
          this.users.set(res.body ?? []);
          this.pagination.set(JSON.parse(res.headers.get('X-Pagination') ?? '{}'));
          this.loading.set(false);
        },
        error: () => { this.toast.error('Error cargando usuarios.'); this.loading.set(false); },
      });
  }

  changePage(p: number): void { this.currentPage.set(p); this.load(); }

  toggleRole(user: AppUser): void {
    const newRole = user.role === 'Admin' ? 'User' : 'Admin';
    if (!confirm(`¿Cambiar el rol de "${user.userName}" a ${newRole}?`)) return;

    this.http
      .put(`${environment.apiUrl}/api/admin/users/${user.id}/role`, { role: newRole })
      .subscribe({
        next: () => {
          this.toast.success(`Rol actualizado a ${newRole}.`);
          this.load();
        },
        error: () => this.toast.error('Error al cambiar el rol.'),
      });
  }
}
