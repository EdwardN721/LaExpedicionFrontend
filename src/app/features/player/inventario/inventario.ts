import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioService } from '../../../core/services/inventario.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario.html'
})
export class InventarioComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  private toast = inject(ToastService);

  items = signal<any[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.cargarInventario();
  }

  cargarInventario(): void {
    this.loading.set(true); // Aseguramos que muestre el esqueleto de carga
    
    const personajeId = localStorage.getItem('personajeActivoId');

    if (!personajeId) {
      this.toast.error('El personaje aún no está listo. Vuelve al Campamento.');
      this.loading.set(false);
      return;
    }

    this.inventarioService.getInventario(personajeId).subscribe({
      next: (res: any) => {
        const listaItems = res?.data || res?.items || res || [];
        this.items.set(Array.isArray(listaItems) ? listaItems : []);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar inventario:', err);
        this.toast.error('No se pudo abrir la mochila.');
        this.loading.set(false);
      }
    });
  }

  toggleEquipar(inv: any): void {
    if (inv.equipado) {
      this.inventarioService.desequiparItem(inv.id).subscribe({
        next: () => {
          this.toast.success(`Has desequipado: ${inv.item?.nombre}`);
          this.cargarInventario(); 
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Magia negra impide desequipar este objeto.');
        }
      });
    } 
    else {
      this.inventarioService.equiparItem(inv.id).subscribe({
        next: () => {
          this.toast.success(`Has equipado: ${inv.item?.nombre}`);
          this.cargarInventario(); 
        },
        error: (err) => {
          console.error(err);
          this.toast.error('No tienes suficiente poder para equipar esto.');
        }
      });
    }
  }

  usarItem(inv: any): void {
    if (inv.usosRestantes <= 0) {
      this.toast.error('Este objeto se ha quedado sin magia/usos.');
      return;
    }

    // Llama al servicio que corregimos en el paso anterior
    this.inventarioService.usarItem(inv.id, 1).subscribe({
      next: (res: any) => {
        this.toast.success(`Has usado: ${inv.item?.nombre || inv.nombreItem}`);
        this.cargarInventario();
      },
      error: (err: any) => {
        console.error('Error al usar item:', err);
        this.toast.error('No se pudo utilizar el objeto.');
      }
    });
  }

  // Reemplaza el método tirarItem con esto:
  venderItem(inv: any): void {
    const precioVenta = (inv.item?.precio || 0) / 2; // Lo vendes a mitad de precio
    const confirmar = confirm(`¿Deseas vender ${inv.item?.nombre || inv.nombreItem} por ${precioVenta} de oro?`);
    
    if (confirmar) {
      this.inventarioService.venderItem(inv.id).subscribe({
        next: () => {
          this.toast.success(`Has ganado ${precioVenta} monedas de oro.`);
          this.cargarInventario(); 
        },
        error: (err: any) => {
          this.toast.error('El mercader no quiere comprar esta basura.');
        }
      });
    }
  }

}