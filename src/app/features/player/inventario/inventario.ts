import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioService } from '../../../core/services/inventario.service';
import { PlayerService } from '../../../core/services/player.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { InventarioDto } from '../../../core/models/player.models';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class InventarioComponent implements OnInit {
  private readonly invSvc = inject(InventarioService);
  private readonly playerSvc = inject(PlayerService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly inventario = signal<InventarioDto[]>([]);
  readonly loading = signal(true);
  personajeId: string | null = null;

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.sub;
    if (userId) {
      this.playerSvc.getPersonajeByUsuarioId(userId).subscribe({
        next: (p) => {
          this.personajeId = p.id;
          this.cargarInventario();
        },
        error: () => { this.loading.set(false); }
      });
    }
  }

  cargarInventario(): void {
    if (!this.personajeId) return;
    this.loading.set(true);
    // Solicitamos la página 1, límite 50 (puedes ajustar o agregar controles de paginación después)
    this.invSvc.obtenerInventario(this.personajeId, 1, 50).subscribe({
      next: (res) => {
        this.inventario.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al abrir la mochila.');
        this.loading.set(false);
      }
    });
  }

  usarItem(item: InventarioDto): void {
    if (item.usosRestantes <= 0) {
      this.toast.error('El objeto está roto o vacío.');
      return;
    }
    this.invSvc.usarItem(item.id).subscribe({
      next: (res: any) => {
        this.toast.success(res.mensaje || 'Objeto utilizado.');
        this.cargarInventario(); // Recargamos para actualizar los usos
      },
      error: () => this.toast.error('No se pudo usar el objeto.')
    });
  }

  equiparItem(item: InventarioDto): void {
    this.invSvc.equiparItem(item.id).subscribe({
      next: (res: any) => {
        this.toast.success(res.mensaje || 'Estado de equipamiento cambiado.');
        this.cargarInventario();
      },
      error: () => this.toast.error('Error al cambiar equipo.')
    });
  }

  tirarItem(item: InventarioDto): void {
    if (!confirm(`¿Estás seguro de que deseas tirar ${item.nombreItem}? Se perderá para siempre.`)) return;
    this.invSvc.eliminarDelInventario(item.id).subscribe({
      next: () => {
        this.toast.success('Objeto descartado.');
        this.cargarInventario();
      },
      error: () => this.toast.error('Error al descartar el objeto.')
    });
  }
}