import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../core/services/player.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AdventureRecord } from '../../../core/models/player.models';
import { PaginationMeta } from '../../../core/models/item.models';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="font-rpg text-2xl text-rpg-text mb-1">Historial de Aventuras</h2>
      <p class="text-rpg-muted text-sm mb-6">Registro de tus expediciones pasadas</p>

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
                <th>Expedición</th>
                <th>Fecha</th>
                <th>Resultado</th>
                <th>Oro ganado</th>
                <th>XP ganada</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              @for (record of records(); track record.id) {
                <tr>
                  <td class="font-medium text-rpg-text">{{ record.expedicionNombre }}</td>
                  <td class="text-rpg-muted text-sm">
                    {{ record.fecha | date:'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td>
                    @if (record.exito) {
                      <span class="badge-success">Éxito</span>
                    } @else {
                      <span class="badge-danger">Fracaso</span>
                    }
                  </td>
                  <td class="text-rpg-gold">+{{ record.oroDobtenido }}</td>
                  <td class="text-rpg-success">+{{ record.experienciaObtenida }}</td>
                  <td class="text-rpg-muted text-sm max-w-xs truncate">
                    {{ record.descripcionResultado }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center text-rpg-muted py-12">
                    Aún no has emprendido ninguna aventura.
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
export class HistorialComponent implements OnInit {
  private readonly svc = inject(PlayerService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly records = signal<AdventureRecord[]>([]);
  readonly pagination = signal<PaginationMeta | null>(null);
  readonly currentPage = signal(1);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getHistory(this.currentPage(), 10).subscribe({
      next: (r) => { this.records.set(r.data); this.pagination.set(r.pagination); this.loading.set(false); },
      error: () => { this.toast.error('Error cargando historial.'); this.loading.set(false); },
    });
  }

  changePage(p: number): void { this.currentPage.set(p); this.load(); }
}
