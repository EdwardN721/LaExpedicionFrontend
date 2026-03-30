import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpeditionService } from '../../../core/services/expedition.service';
import { ExpedicionRealizadaService } from '../../../core/services/expedicion-realizada.service';
import { ToastService } from '../../../shared/services/toast.service';
// 👇 Asegúrate de importar tu DTO o modelo del mapa
import { ExpedicionDto } from '../../../core/models/expedition.models'; 
import { PaginationMeta } from '../../../core/models/expedition.models';

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

  // 👇 Signals adaptados para la paginación (igual que en historial)
  readonly expediciones = signal<ExpedicionDto[]>([]);
  readonly pagination = signal<PaginationMeta | null>(null);
  readonly currentPage = signal(1);
  
  loading = signal<boolean>(true);
  enAventura = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarMapa();
  }

  cargarMapa(): void {
    this.loading.set(true);

    // 👇 Si tu servicio ahora exige paginación, le mandamos la página y el límite (ej. 10)
    // Si tu servicio no exige paginación, quítale "this.currentPage(), 10"
    this.expeditionService.getExpediciones(this.currentPage(), 10).subscribe({
      next: (res: any) => {
        // Adaptado para recibir la respuesta paginada { data: [...], pagination: {...} }
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

  emprenderExpedicion(expedicionId: string): void {
    const personajeId = localStorage.getItem('personajeActivoId');

    if (!personajeId) {
      this.toast.error('No tienes un héroe para enviar a esta aventura.');
      return;
    }

    this.enAventura.set(true);
    
    // Llamada al endpoint POST vacío que tienes en el backend
    this.aventuraService.emprenderAventura(personajeId, expedicionId).subscribe({
      next: (resultado: any) => {
        this.toast.success('¡Has regresado de la expedición con gloria!');
        this.enAventura.set(false);
        
        // Opcional: Podrías redirigir al historial para ver qué pasó
        // this.router.navigate(['/play/historial']);
      },
      error: (err: any) => {
        console.error('Error en expedición:', err);
        this.toast.error('La expedición ha fracasado catastróficamente.');
        this.enAventura.set(false);
      }
    });
  }
  
  // 👇 Por si quieres poner botones de paginación en el HTML
  cambiarPagina(nuevaPagina: number): void {
    this.currentPage.set(nuevaPagina);
    this.cargarMapa();
  }
}