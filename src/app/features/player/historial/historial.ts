import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ExpedicionRealizadaService } from '../../../core/services/expedicion-realizada.service';
import { PlayerService } from '../../../core/services/player.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ExpedicionRealizadaDto, PaginationMeta } from '../../../core/models/expedition.models';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class HistorialComponent implements OnInit {
  private readonly expRealizadaSvc = inject(ExpedicionRealizadaService);
  private readonly playerSvc = inject(PlayerService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly records = signal<ExpedicionRealizadaDto[]>([]);
  readonly loading = signal(true);
  readonly pagination = signal<PaginationMeta | null>(null);
  readonly currentPage = signal(1);
  personajeId: string | null = null;

  ngOnInit() {
    const userId = this.auth.currentUser()?.sub;
    if (userId) {
      this.playerSvc.getPersonajeByUsuarioId(userId).subscribe({
        next: (p) => {
          this.personajeId = p.id;
          this.loadHistory();
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  loadHistory() {
    if (!this.personajeId) return;
    this.loading.set(true);
    this.expRealizadaSvc.obtenerHistorial(this.personajeId, this.currentPage(), 10).subscribe({
      next: (res) => {
        this.records.set(res.data);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar el diario.');
        this.loading.set(false);
      }
    });
  }

  changePage(p: number) {
    this.currentPage.set(p);
    this.loadHistory();
  }
}