import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../core/services/player.service';
import { ExpeditionService } from '../../../core/services/expedition.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Expedition } from '../../../core/models/expedition.models';
import { PaginationMeta } from '../../../core/models/item.models';
import { AdventureRecord } from '../../../core/models/player.models';

@Component({
  selector: 'app-mapa-expediciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="font-rpg text-2xl text-rpg-text mb-1">Mapa de Expediciones</h2>
      <p class="text-rpg-muted text-sm mb-6">Elige tu próximo destino y emprende la aventura</p>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="rpg-card animate-pulse h-28"></div>
          }
        </div>
      } @else {
        <div class="space-y-4">
          @for (exp of expeditions(); track exp.id) {
            <div class="rpg-card flex flex-col sm:flex-row sm:items-center gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-1">
                  <h3 class="font-rpg text-lg text-rpg-text">{{ exp.nombre }}</h3>
                  <span [class]="diffClass(exp.dificultad)">{{ exp.dificultad }}</span>
                </div>
                <p class="text-rpg-muted text-sm mb-2">{{ exp.descripcion }}</p>
                <div class="flex flex-wrap gap-4 text-xs text-rpg-muted">
                  <span>Nivel rec.: <strong class="text-rpg-text">{{ exp.nivelRecomendado }}</strong></span>
                  <span>Duración: <strong class="text-rpg-text">{{ exp.duracionHoras }}h</strong></span>
                  <span class="text-rpg-gold">+{{ exp.recompensaOro }} oro</span>
                  <span class="text-rpg-success">+{{ exp.recompensaExperiencia }} XP</span>
                </div>
              </div>

              <button
                class="btn-primary shrink-0 text-sm px-6 py-3 shadow-gold-lg"
                [disabled]="adventuring() === exp.id"
                (click)="startAdventure(exp)"
              >
                @if (adventuring() === exp.id) {
                  <span class="inline-block w-4 h-4 border-2 border-rpg-bg/40
                               border-t-rpg-bg rounded-full animate-spin mr-2"></span>
                  Partiendo…
                } @else {
                  ¡Emprender Aventura!
                }
              </button>
            </div>
          } @empty {
            <p class="text-center text-rpg-muted py-16">No hay expediciones disponibles.</p>
          }
        </div>

        @if (pagination(); as pg) {
          <div class="flex items-center justify-between mt-6 text-sm text-rpg-muted">
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

      <!-- Result modal -->
      @if (result()) {
        <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div class="rpg-card w-full max-w-md text-center">
            @if (result()!.exito) {
              <div class="text-5xl mb-4">⚔️</div>
              <h3 class="font-rpg text-2xl text-rpg-success mb-2">¡Victoria!</h3>
            } @else {
              <div class="text-5xl mb-4">💀</div>
              <h3 class="font-rpg text-2xl text-rpg-danger mb-2">Derrota</h3>
            }
            <p class="text-rpg-muted mb-4">{{ result()!.descripcionResultado }}</p>
            <div class="flex justify-center gap-6 mb-6 text-sm">
              <span class="text-rpg-gold">+{{ result()!.oroDobtenido }} oro</span>
              <span class="text-rpg-success">+{{ result()!.experienciaObtenida }} XP</span>
            </div>
            <button class="btn-primary" (click)="result.set(null)">Continuar</button>
          </div>
        </div>
      }
    </div>
  `,
})
export class MapaExpedicionesComponent implements OnInit {
  private readonly expeditionSvc = inject(ExpeditionService);
  private readonly playerSvc = inject(PlayerService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly adventuring = signal<number | null>(null);
  readonly expeditions = signal<Expedition[]>([]);
  readonly pagination = signal<PaginationMeta | null>(null);
  readonly currentPage = signal(1);
  readonly result = signal<AdventureRecord | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.expeditionSvc.getAll(this.currentPage(), 6).subscribe({
      next: (r) => { this.expeditions.set(r.data); this.pagination.set(r.pagination); this.loading.set(false); },
      error: () => { this.toast.error('Error cargando expediciones.'); this.loading.set(false); },
    });
  }

  changePage(p: number): void { this.currentPage.set(p); this.load(); }

  startAdventure(exp: Expedition): void {
    this.adventuring.set(exp.id);
    this.playerSvc.startAdventure(exp.id).subscribe({
      next: (record) => {
        this.adventuring.set(null);
        this.result.set(record);
        if (record.exito) {
          this.toast.success(`¡Expedición superada! +${record.oroDobtenido} oro`);
        } else {
          this.toast.error('La expedición terminó en derrota.');
        }
      },
      error: () => { this.adventuring.set(null); this.toast.error('Error al iniciar la expedición.'); },
    });
  }

  diffClass(d: string): string {
    const map: Record<string, string> = {
      Facil: 'badge-success', Normal: 'badge-gold',
      Dificil: 'badge-danger',
      Legendario: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/40 text-purple-300',
    };
    return map[d] ?? 'badge-gold';
  }
}
