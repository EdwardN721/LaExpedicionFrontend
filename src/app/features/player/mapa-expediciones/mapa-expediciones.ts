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
  templateUrl: `./mapa-expediciones.html`,
  styleUrl: './mapa-expediciones.css'
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
