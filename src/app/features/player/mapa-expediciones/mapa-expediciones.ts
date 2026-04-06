import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpeditionService } from '../../../core/services/expedition.service';
import { ExpedicionRealizadaService } from '../../../core/services/expedicion-realizada.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ExpedicionDto, PaginationMeta, EventoExpedicionDto, OpcionEventoDto } from '../../../core/models/expedition.models';

@Component({
  selector: 'app-mapa-expediciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa-expediciones.html'
})
export class MapaExpedicionesComponent implements OnInit {
  private expeditionService = inject(ExpeditionService);
  private aventuraService = inject(ExpedicionRealizadaService);
  private toast = inject(ToastService);

  // Signals adaptados para la paginación
  readonly expediciones = signal<ExpedicionDto[]>([]);
  readonly pagination = signal<PaginationMeta | null>(null);
  readonly currentPage = signal(1);

  // Variables para los eventos
  eventoActivo = signal<EventoExpedicionDto | null>(null);
  mostrarModalEvento = signal(false);
  opcionSeleccionada = signal<OpcionEventoDto | null>(null);

  // Guardamos temporalmente a qué lugar quiere entrar el jugador
  expedicionPendienteId = signal<string | null>(null);

  loading = signal<boolean>(true);
  enAventura = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarMapa();
  }

  cargarMapa(): void {
    this.loading.set(true);

    this.expeditionService.getExpediciones(this.currentPage(), 10).subscribe({
      next: (res: any) => {
        this.expediciones.set(res?.data || res?.items || res || []);

        if (res?.pagination) {
          this.pagination.set(res.pagination);
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error cargando mapa:', err);
        this.toast.error('Las nubes ocultan el mapa hoy.');
        this.loading.set(false);
      }
    });
  }

  // 🎭 FASE 1: El jugador elige un lugar. Pedimos el evento al servidor y abrimos el Modal.
  emprenderExpedicion(expedicionId: string): void {
    const personajeId = localStorage.getItem('personajeActivoId');

    if (!personajeId) {
      this.toast.error('No tienes un héroe para enviar a esta aventura.');
      return;
    }

    this.enAventura.set(true);

    this.aventuraService.obtenerEventoAleatorio().subscribe({
      next: (evento) => {
        this.eventoActivo.set(evento);
        this.expedicionPendienteId.set(expedicionId); // Guardamos el lugar para después
        this.opcionSeleccionada.set(null);

        this.mostrarModalEvento.set(true);
        this.enAventura.set(false);
      },
      error: (err) => {
        console.error('Error al cargar el evento', err);
        this.toast.error('El Dungeon Master no está disponible en este momento.');
        this.enAventura.set(false);
      }
    });
  }

  // ⚔️ FASE 2: El jugador leyó la historia y tomó una decisión en el Modal.
  ejecutarDecision(opcion: OpcionEventoDto): void {
    this.opcionSeleccionada.set(opcion);
    this.toast.info('Los dados están rodando...');

    const personajeId = localStorage.getItem('personajeActivoId');
    const expedicionId = this.expedicionPendienteId();

    if (!personajeId || !expedicionId) return;

    this.enAventura.set(true);

    const payload = {
      personajeId: personajeId,
      expedicionId: expedicionId,
      opcionElegida: opcion
    };

    this.aventuraService.emprenderAventura(payload).subscribe({
      next: (resultado: any) => {
        this.mostrarModalEvento.set(false);
        // Mostrar en el Toast si fue éxito o fallo
        if (resultado.exito || resultado.esExito) {
          this.toast.success('¡Victoria! Revisa tu bitácora.');
        } else {
          this.toast.error('Has sufrido heridas. Revisa tu bitácora.');
        }
        this.enAventura.set(false);
      },
      error: (err: any) => {
        console.error('Error en expedición:', err);
        this.mostrarModalEvento.set(false);
        this.toast.error('El destino ha sido cruel contigo...');
        this.enAventura.set(false);
      }
    });
  }

  cambiarPagina(nuevaPagina: number): void {
    this.currentPage.set(nuevaPagina);
    this.cargarMapa();
  }
}
