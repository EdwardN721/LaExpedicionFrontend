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
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="font-rpg text-2xl text-rpg-text">Gestión de Expediciones</h2>
          <p class="text-rpg-muted text-sm mt-0.5">
            {{ pagination()?.totalCount ?? 0 }} expediciones
          </p>
        </div>
        <button class="btn-primary" (click)="openModal()">+ Nueva Expedición</button>
      </div>

      @if (loading()) {
        <div class="rpg-card animate-pulse space-y-3">
          @for (i of [1,2,3]; track i) {
            <div class="h-12 bg-rpg-border/40 rounded"></div>
          }
        </div>
      } @else {
        <div class="rpg-card overflow-x-auto p-0">
          <table class="rpg-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Dificultad</th>
                <th>Nivel rec.</th>
                <th>Duración</th>
                <th>Recompensa</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (exp of expeditions(); track exp.id) {
                <tr>
                  <td class="font-medium text-rpg-text">{{ exp.nombre }}</td>
                  <td>
                    <span [class]="diffBadge(exp.dificultad)">
                      {{ exp.dificultad }}
                    </span>
                  </td>
                  <td>Nv. {{ exp.nivelRecomendado }}</td>
                  <td>{{ exp.duracionHoras }}h</td>
                  <td class="text-rpg-gold">
                    {{ exp.recompensaOro }} oro / {{ exp.recompensaExperiencia }} XP
                  </td>
                  <td class="text-right space-x-2">
                    <button class="text-rpg-gold hover:underline text-sm"
                            (click)="openModal(exp)">Editar</button>
                    <button class="text-rpg-danger hover:underline text-sm"
                            (click)="delete(exp)">Eliminar</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center text-rpg-muted py-10">
                    No hay expediciones registradas.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (pagination(); as pg) {
          <div class="flex items-center justify-between mt-4 text-sm text-rpg-muted">
            <span>Página {{ pg.currentPage }} de {{ pg.totalPages }}</span>
            <div class="flex gap-2">
              <button class="btn-secondary py-1.5 px-3 text-xs"
                      [disabled]="!pg.hasPrevious"
                      (click)="changePage(pg.currentPage - 1)">Anterior</button>
              <button class="btn-secondary py-1.5 px-3 text-xs"
                      [disabled]="!pg.hasNext"
                      (click)="changePage(pg.currentPage + 1)">Siguiente</button>
            </div>
          </div>
        }
      }
    </div>

    @if (showModal()) {
      <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
           (click)="closeModal()">
        <div class="rpg-card w-full max-w-lg" (click)="$event.stopPropagation()">
          <h3 class="font-rpg text-xl text-rpg-text mb-5">
            {{ editing() ? 'Editar Expedición' : 'Nueva Expedición' }}
          </h3>

          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <div>
              <label class="rpg-label">Nombre</label>
              <input class="rpg-input" formControlName="nombre" />
            </div>
            <div>
              <label class="rpg-label">Descripción</label>
              <textarea class="rpg-input resize-none" rows="2" formControlName="descripcion"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="rpg-label">Nivel recomendado</label>
                <input class="rpg-input" type="number" formControlName="nivelRecomendado" />
              </div>
              <div>
                <label class="rpg-label">Duración (horas)</label>
                <input class="rpg-input" type="number" formControlName="duracionHoras" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="rpg-label">Recompensa oro</label>
                <input class="rpg-input" type="number" formControlName="recompensaOro" />
              </div>
              <div>
                <label class="rpg-label">Recompensa XP</label>
                <input class="rpg-input" type="number" formControlName="recompensaExperiencia" />
              </div>
            </div>
            <div>
              <label class="rpg-label">Dificultad</label>
              <select class="rpg-input" formControlName="dificultad">
                @for (d of dificultades; track d) {
                  <option [value]="d">{{ d }}</option>
                }
              </select>
            </div>

            <div class="flex justify-end gap-3 pt-2 border-t border-rpg-border">
              <button type="button" class="btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="saving()">
                @if (saving()) {
                  <span class="inline-block w-4 h-4 border-2 border-rpg-bg/40
                               border-t-rpg-bg rounded-full animate-spin mr-2"></span>
                }
                {{ editing() ? 'Guardar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
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
