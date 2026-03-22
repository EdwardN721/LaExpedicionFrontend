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
  templateUrl: `./item-list.html`,
  styleUrl: './item-list.css'
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
