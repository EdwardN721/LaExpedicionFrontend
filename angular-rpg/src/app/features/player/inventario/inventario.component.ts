import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../core/services/player.service';
import { ToastService } from '../../../shared/services/toast.service';
import { InventoryItem } from '../../../core/models/player.models';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="font-rpg text-2xl text-rpg-text mb-1">Inventario</h2>
      <p class="text-rpg-muted text-sm mb-6">Tus posesiones y equipamiento</p>

      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="rpg-card aspect-square animate-pulse bg-rpg-border/40"></div>
          }
        </div>
      } @else if (items().length === 0) {
        <div class="text-center py-20 text-rpg-muted">
          <p class="font-rpg text-xl mb-2">Inventario vacío</p>
          <p class="text-sm">Completa expediciones para obtener items.</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          @for (item of items(); track item.id) {
            <div
              class="rpg-card flex flex-col gap-2 relative"
              [class.border-rpg-gold]="item.equipado"
              [class.shadow-gold]="item.equipado"
            >
              @if (item.equipado) {
                <span class="absolute top-2 right-2 badge-gold text-[10px]">Equipado</span>
              }

              <!-- Icon placeholder -->
              <div class="w-12 h-12 rounded-lg bg-rpg-border flex items-center justify-center
                          text-rpg-gold font-rpg text-xl self-center mt-1">
                {{ item.tipo.charAt(0) }}
              </div>

              <div>
                <p class="text-rpg-text text-sm font-medium leading-tight">{{ item.nombre }}</p>
                <p class="text-rpg-muted text-xs">{{ item.tipo }}</p>
              </div>

              <!-- Durability bar -->
              @if (item.durabilidadMaxima) {
                <div>
                  <div class="flex justify-between text-xs text-rpg-muted mb-0.5">
                    <span>Durabilidad</span>
                    <span>{{ item.usosRestantes }}/{{ item.durabilidadMaxima }}</span>
                  </div>
                  <div class="w-full bg-rpg-border rounded-full h-1.5">
                    <div
                      class="h-1.5 rounded-full transition-all"
                      [class]="durabilityColor(item)"
                      [style.width.%]="durabilityPercent(item)"
                    ></div>
                  </div>
                </div>
              }

              <!-- Actions -->
              <div class="flex gap-1.5 mt-auto pt-1">
                <button
                  class="flex-1 text-xs py-1.5 rounded-md border border-rpg-gold
                         text-rpg-gold hover:bg-rpg-gold/10 transition"
                  (click)="toggleEquip(item)"
                >
                  {{ item.equipado ? 'Desequipar' : 'Equipar' }}
                </button>
                <button
                  class="text-xs px-2 py-1.5 rounded-md border border-rpg-danger/50
                         text-rpg-danger hover:bg-rpg-danger/10 transition"
                  (click)="dropItem(item)"
                  title="Tirar item"
                >
                  ✕
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class InventarioComponent implements OnInit {
  private readonly svc = inject(PlayerService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly items = signal<InventoryItem[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.svc.getInventory().subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => { this.toast.error('Error al cargar el inventario.'); this.loading.set(false); },
    });
  }

  toggleEquip(item: InventoryItem): void {
    const req = item.equipado
      ? this.svc.unequipItem(item.id)
      : this.svc.equipItem(item.id);

    req.subscribe({
      next: () => {
        this.toast.success(item.equipado ? `${item.nombre} desequipado.` : `${item.nombre} equipado.`);
        this.load();
      },
      error: () => this.toast.error('Error al cambiar equipo.'),
    });
  }

  dropItem(item: InventoryItem): void {
    if (!confirm(`¿Tirar "${item.nombre}"? Esta acción no se puede deshacer.`)) return;
    this.svc.dropItem(item.id).subscribe({
      next: () => { this.toast.success(`${item.nombre} tirado.`); this.load(); },
      error: () => this.toast.error('Error al tirar el item.'),
    });
  }

  durabilityPercent(item: InventoryItem): number {
    if (!item.durabilidadMaxima || !item.usosRestantes) return 0;
    return (item.usosRestantes / item.durabilidadMaxima) * 100;
  }

  durabilityColor(item: InventoryItem): string {
    const p = this.durabilityPercent(item);
    if (p > 60) return 'bg-rpg-success';
    if (p > 25) return 'bg-rpg-gold';
    return 'bg-rpg-danger';
  }
}
