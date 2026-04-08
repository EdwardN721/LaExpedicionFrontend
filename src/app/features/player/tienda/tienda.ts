import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemService } from '../../../core/services/item.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tienda.html',
  styleUrl: './tienda.css',
})
export class Tienda implements OnInit {
  private itemSvc = inject(ItemService);
  private invSvc = inject(InventarioService);
  private toast = inject(ToastService);

  articulos = signal<any[]>([]);
  loading = signal(true);
  comprandoId = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarArticulos();
  }

  cargarArticulos(): void {
    const params = {
      PageNumber: 1,
      PageSize: 50
    }

    this.itemSvc.getItems(params).subscribe({
      next: (res) => {
        const lista = res.data || [];
        this.articulos.set(lista);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('El mercader ha cerrado su tienda por hoy.');
        this.loading.set(false);
      },
    });
  }

  comprarItem(item: any): void {
    const personajeId = localStorage.getItem('personajeActivoId');
    if (!personajeId) {
      this.toast.error('Necesitas un personaje activo para comerciar.');
      return;
    }

    this.comprandoId.set(item.id);

    const dto = {
      personajeId: personajeId,
      itemId: item.id,
    };

    this.invSvc.comprarItemMercader(dto as any).subscribe({
      next: () => {
        this.toast.success(`¡Has adquirido: ${item.nombre}!`);
        this.comprandoId.set(null);
      },
      error: (err: any) => {
        console.error('Error de compra', err);
        const mensaje =
          err.error?.mensaje || 'No tienes suficiente oro para esto.';
        this.toast.error(mensaje);
        this.comprandoId.set(null);
      },
    });
  }
}
