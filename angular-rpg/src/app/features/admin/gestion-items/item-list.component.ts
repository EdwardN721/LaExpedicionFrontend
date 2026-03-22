import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ItemService } from '../../../core/services/item.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Item, PaginationMeta, StatModifier } from '../../../core/models/item.models';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="font-rpg text-2xl text-rpg-text">Gestión de Items</h2>
          <p class="text-rpg-muted text-sm mt-0.5">
            {{ pagination()?.totalCount ?? 0 }} items en total
          </p>
        </div>
        <button class="btn-primary" (click)="openModal()">+ Nuevo Item</button>
      </div>

      <!-- Table skeleton -->
      @if (loading()) {
        <div class="rpg-card animate-pulse space-y-3">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="h-10 bg-rpg-border/40 rounded"></div>
          }
        </div>
      } @else {
        <!-- Table -->
        <div class="rpg-card overflow-x-auto p-0">
          <table class="rpg-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Durabilidad</th>
                <th>Precio</th>
                <th>Modificadores</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track item.id) {
                <tr>
                  <td class="font-medium text-rpg-text">{{ item.nombre }}</td>
                  <td>
                    <span class="badge-gold">{{ item.tipo }}</span>
                  </td>
                  <td>
                    @if (item.durabilidadMaxima) {
                      <span>{{ item.usosRestantes }} / {{ item.durabilidadMaxima }}</span>
                    } @else {
                      <span class="text-rpg-muted">—</span>
                    }
                  </td>
                  <td class="text-rpg-gold">{{ item.precio }} oro</td>
                  <td>
                    @if (item.modificadoresEstadisticas.length) {
                      <span class="text-rpg-muted text-xs">
                        {{ formatMods(item.modificadoresEstadisticas) }}
                      </span>
                    } @else {
                      <span class="text-rpg-muted">—</span>
                    }
                  </td>
                  <td class="text-right space-x-2">
                    <button
                      class="text-rpg-gold hover:underline text-sm"
                      (click)="openModal(item)"
                    >
                      Editar
                    </button>
                    <button
                      class="text-rpg-danger hover:underline text-sm"
                      (click)="deleteItem(item)"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center text-rpg-muted py-10">
                    No hay items registrados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (pagination(); as pg) {
          <div class="flex items-center justify-between mt-4 text-sm text-rpg-muted">
            <span>
              Página {{ pg.currentPage }} de {{ pg.totalPages }}
            </span>
            <div class="flex gap-2">
              <button
                class="btn-secondary py-1.5 px-3 text-xs"
                [disabled]="!pg.hasPrevious"
                (click)="changePage(pg.currentPage - 1)"
              >
                Anterior
              </button>
              <button
                class="btn-secondary py-1.5 px-3 text-xs"
                [disabled]="!pg.hasNext"
                (click)="changePage(pg.currentPage + 1)"
              >
                Siguiente
              </button>
            </div>
          </div>
        }
      }
    </div>

    <!-- ── Modal ──────────────────────────────────────────────────────────── -->
    @if (showModal()) {
      <div
        class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        (click)="closeModal()"
      >
        <div
          class="rpg-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <h3 class="font-rpg text-xl text-rpg-text mb-5">
            {{ editingItem() ? 'Editar Item' : 'Nuevo Item' }}
          </h3>

          <form [formGroup]="form" (ngSubmit)="save()" novalidate class="space-y-4">
            <!-- Nombre -->
            <div>
              <label class="rpg-label">Nombre</label>
              <input class="rpg-input" formControlName="nombre" placeholder="Espada de Fuego" />
            </div>

            <!-- Descripción -->
            <div>
              <label class="rpg-label">Descripción</label>
              <textarea
                class="rpg-input resize-none"
                rows="2"
                formControlName="descripcion"
              ></textarea>
            </div>

            <!-- Tipo + Durabilidad + Precio -->
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="rpg-label">Tipo</label>
                <input class="rpg-input" formControlName="tipo" placeholder="Arma" />
              </div>
              <div>
                <label class="rpg-label">Durabilidad máx.</label>
                <input class="rpg-input" type="number" formControlName="durabilidadMaxima" />
              </div>
              <div>
                <label class="rpg-label">Precio (oro)</label>
                <input class="rpg-input" type="number" formControlName="precio" />
              </div>
            </div>

            <!-- Stat modifiers (dynamic) -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="rpg-label mb-0">Modificadores de estadísticas</label>
                <button
                  type="button"
                  class="text-rpg-gold text-xs hover:underline"
                  (click)="addModifier()"
                >
                  + Añadir
                </button>
              </div>

              <div formArrayName="modificadoresEstadisticas" class="space-y-2">
                @for (mod of modifiers.controls; track $index) {
                  <div [formGroupName]="$index" class="flex gap-2 items-center">
                    <input
                      class="rpg-input"
                      formControlName="stat"
                      placeholder="Estadística (ej. Fuerza)"
                    />
                    <input
                      class="rpg-input w-28"
                      type="number"
                      formControlName="value"
                      placeholder="Valor"
                    />
                    <button
                      type="button"
                      class="text-rpg-danger hover:text-rpg-danger/70 transition shrink-0"
                      (click)="removeModifier($index)"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                }
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-2 border-t border-rpg-border">
              <button type="button" class="btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn-primary flex items-center gap-2"
                [disabled]="saving()"
              >
                @if (saving()) {
                  <span class="inline-block w-4 h-4 border-2 border-rpg-bg/40
                               border-t-rpg-bg rounded-full animate-spin"></span>
                }
                {{ editingItem() ? 'Guardar cambios' : 'Crear Item' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class ItemListComponent implements OnInit {
  private readonly itemService = inject(ItemService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  // ── State ────────────────────────────────────────────────────────────────
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showModal = signal(false);
  readonly editingItem = signal<Item | null>(null);
  readonly items = signal<Item[]>([]);
  readonly pagination = signal<PaginationMeta | null>(null);
  readonly currentPage = signal(1);

  // ── Form ─────────────────────────────────────────────────────────────────
  readonly form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    tipo: ['', Validators.required],
    durabilidadMaxima: [null as number | null],
    precio: [0, [Validators.required, Validators.min(0)]],
    modificadoresEstadisticas: this.fb.array([]),
  });

  get modifiers(): FormArray {
    return this.form.get('modificadoresEstadisticas') as FormArray;
  }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.itemService.getAll(this.currentPage(), 10).subscribe({
      next: (result) => {
        this.items.set(result.data);
        this.pagination.set(result.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar los items.');
        this.loading.set(false);
      },
    });
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadItems();
  }

  openModal(item?: Item): void {
    this.editingItem.set(item ?? null);
    this.modifiers.clear();

    if (item) {
      this.form.patchValue({
        nombre: item.nombre,
        descripcion: item.descripcion,
        tipo: item.tipo,
        durabilidadMaxima: item.durabilidadMaxima,
        precio: item.precio,
      });
      item.modificadoresEstadisticas.forEach((m) => this.addModifier(m));
    } else {
      this.form.reset({ precio: 0 });
    }

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingItem.set(null);
  }

  addModifier(mod?: StatModifier): void {
    this.modifiers.push(
      this.fb.group({
        stat: [mod?.stat ?? '', Validators.required],
        value: [mod?.value ?? 0, Validators.required],
      })
    );
  }

  removeModifier(index: number): void {
    this.modifiers.removeAt(index);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const dto = this.form.getRawValue() as any;
    const editing = this.editingItem();

    const req = editing
      ? this.itemService.update(editing.id, dto)
      : this.itemService.create(dto);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(
          editing ? 'Item actualizado correctamente.' : 'Item creado correctamente.'
        );
        this.closeModal();
        this.loadItems();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Error al guardar el item.');
      },
    });
  }

  deleteItem(item: Item): void {
    if (!confirm(`¿Eliminar "${item.nombre}"? Esta acción no se puede deshacer.`)) return;

    this.itemService.delete(item.id).subscribe({
      next: () => {
        this.toast.success(`"${item.nombre}" eliminado.`);
        this.loadItems();
      },
      error: () => this.toast.error('Error al eliminar el item.'),
    });
  }

  formatMods(mods: StatModifier[]): string {
    return mods.map((m) => `${m.stat} +${m.value}`).join(', ');
  }
}
