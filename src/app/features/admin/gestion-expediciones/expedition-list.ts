import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpeditionService } from '../../../core/services/expedition.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
  Expedition
} from '../../../core/models/expedition.models';
import { PaginationMeta as PM } from '../../../core/models/item.models';

const DIFICULTADES = ['Facil', 'Normal', 'Dificil', 'Legendario'];

@Component({
  selector: 'app-expedition-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: `./expedition-list.html`,
  styleUrl: './expedition-list.css'
})
export class ExpeditionListComponent implements OnInit {
  private readonly svc = inject(ExpeditionService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly dificultades = DIFICULTADES;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showModal = signal(false);
  readonly editing = signal<Expedition | null>(null);
  readonly expeditions = signal<Expedition[]>([]);
  readonly pagination = signal<PM | null>(null);
  readonly currentPage = signal(1);

  readonly form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    nivelRecomendado: [1, [Validators.required, Validators.min(1)]],
    duracionHoras: [1, [Validators.required, Validators.min(1)]],
    recompensaOro: [0, Validators.required],
    recompensaExperiencia: [0, Validators.required],
    dificultad: ['Normal', Validators.required],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll(this.currentPage(), 10).subscribe({
      next: (r) => { this.expeditions.set(r.data); this.pagination.set(r.pagination); this.loading.set(false); },
      error: () => { this.toast.error('Error cargando expediciones.'); this.loading.set(false); },
    });
  }

  changePage(p: number): void { this.currentPage.set(p); this.load(); }

  openModal(exp?: Expedition): void {
    this.editing.set(exp ?? null);
    exp ? this.form.patchValue(exp as any) : this.form.reset({ nivelRecomendado: 1, duracionHoras: 1, recompensaOro: 0, recompensaExperiencia: 0, dificultad: 'Normal' });
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const dto = this.form.getRawValue() as any;
    const e = this.editing();
    const req = e ? this.svc.update(e.id, dto) : this.svc.create(dto);
    req.subscribe({
      next: () => { this.saving.set(false); this.toast.success(e ? 'Actualizado.' : 'Creado.'); this.closeModal(); this.load(); },
      error: () => { this.saving.set(false); this.toast.error('Error al guardar.'); },
    });
  }

  delete(exp: Expedition): void {
    if (!confirm(`¿Eliminar "${exp.nombre}"?`)) return;
    this.svc.delete(exp.id).subscribe({
      next: () => { this.toast.success('Expedición eliminada.'); this.load(); },
      error: () => this.toast.error('Error al eliminar.'),
    });
  }

  diffBadge(d: string): string {
    const map: Record<string, string> = {
      Facil: 'badge-success', Normal: 'badge-gold',
      Dificil: 'badge-danger', Legendario: 'bg-purple-900/40 text-purple-300 px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex',
    };
    return map[d] ?? 'badge-gold';
  }
}
