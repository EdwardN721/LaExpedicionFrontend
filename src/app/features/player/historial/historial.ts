import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../core/services/player.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AdventureRecord } from '../../../core/models/player.models';
import { PaginationMeta } from '../../../core/models/item.models';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./historial.html`,
  styleUrl: './historial.css'
})
export class HistorialComponent implements OnInit {
  private readonly svc = inject(PlayerService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly records = signal<AdventureRecord[]>([]);
  readonly pagination = signal<PaginationMeta | null>(null);
  readonly currentPage = signal(1);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getHistory(this.currentPage(), 10).subscribe({
      next: (r) => { this.records.set(r.data); this.pagination.set(r.pagination); this.loading.set(false); },
      error: () => { this.toast.error('Error cargando historial.'); this.loading.set(false); },
    });
  }

  changePage(p: number): void { this.currentPage.set(p); this.load(); }
}
