import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../core/services/player.service';
import { ToastService } from '../../../shared/services/toast.service';
import { InventoryItem } from '../../../core/models/player.models';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./inventario.html`,
  styleUrl: './inventario.css'
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
