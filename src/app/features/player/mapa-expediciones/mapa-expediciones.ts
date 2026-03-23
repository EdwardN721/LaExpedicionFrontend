import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpeditionService } from '../../../core/services/expedition.service';
import { ExpedicionRealizadaService } from '../../../core/services/expedicion-realizada.service';
import { PlayerService } from '../../../core/services/player.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ExpedicionDto, PaginationMeta } from '../../../core/models/expedition.models';

@Component({
  selector: 'app-mapa-expediciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa-expediciones.html' ,
  styleUrl: './mapa-expediciones.css'
})
export class MapaExpedicionesComponent implements OnInit {
  private readonly expSvc = inject(ExpeditionService);
  private readonly expRealizadaSvc = inject(ExpedicionRealizadaService);
  private readonly playerSvc = inject(PlayerService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly expediciones = signal<ExpedicionDto[]>([]);
  readonly loading = signal(true);
  readonly adventuring = signal<string | null>(null);
  readonly pagination = signal<PaginationMeta | null>(null);
  readonly currentPage = signal(1);
  personajeId: string | null = null;

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.sub;
    if (userId) {
      this.playerSvc.getPersonajeByUsuarioId(userId).subscribe({
        next: (p) => {
          this.personajeId = p.id;
          this.loadExpeditions();
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  loadExpeditions(): void {
    this.loading.set(true);
    this.expSvc.getAll(this.currentPage(), 9).subscribe({
      next: (res) => {
        this.expediciones.set(res.data);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar el mapa.');
        this.loading.set(false);
      }
    });
  }

  changePage(p: number): void {
    this.currentPage.set(p);
    this.loadExpeditions();
  }

  startAdventure(expedicionId: string): void {
    if (!this.personajeId) {
      this.toast.error('Necesitas crear un personaje primero.');
      return;
    }

    this.adventuring.set(expedicionId);
    
    this.expRealizadaSvc.emprenderAventura(this.personajeId, expedicionId).subscribe({
      next: (res) => {
        this.adventuring.set(null);
        if (res.resultado === 'Exito') {
          this.toast.success(`¡Misión completada! Has ganado ${res.dineroGanado} oro y ${res.experienciaGanada} XP.`);
        } else {
          this.toast.error(`Fracasaste en la misión. No obtuviste recompensas.`);
        }
      },
      error: () => {
        this.toast.error('Un error mágico interrumpió la expedición.');
        this.adventuring.set(null);
      }
    });
  }
}