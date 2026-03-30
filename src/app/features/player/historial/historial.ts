import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ExpedicionRealizadaService } from '../../../core/services/expedicion-realizada.service';
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
  // 1. Limpiamos las inyecciones duplicadas y dejamos solo las necesarias
  private readonly expRealizadaSvc = inject(ExpedicionRealizadaService);
  private readonly toast = inject(ToastService);

  readonly records = signal<ExpedicionRealizadaDto[]>([]);
  readonly loading = signal(true);
  readonly pagination = signal<PaginationMeta | null>(null);
  readonly currentPage = signal(1);
  
  personajeId: string | null = null;

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.personajeId = localStorage.getItem('personajeActivoId');

    if (!this.personajeId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    // 2. CORRECCIÓN: Le pasamos el ID, la página actual (1 por defecto) y un límite de 10
    this.expRealizadaSvc.obtenerHistorial(this.personajeId, this.currentPage(), 10).subscribe({
      next: (res) => {
        // 3. CORRECCIÓN: Usamos records (no registros) y guardamos la data y la paginación
        this.records.set(res.data || []);
        this.pagination.set(res.pagination || null);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error cargando historial:', err);
        this.toast.error('No se pudo leer la bitácora.');
        this.loading.set(false);
      }
    });
  }

  // 👇 Método extra: Agrégalo por si quieres poner botones de "Siguiente / Anterior" en tu HTML
  cambiarPagina(nuevaPagina: number): void {
    this.currentPage.set(nuevaPagina);
    this.cargarHistorial();
  }
}