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
  templateUrl: `./user-list.html`,
  styleUrl: './user-list.css'
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
