import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemService } from '../../../core/services/item.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ItemDto, PaginationMeta } from '../../../core/models/item.models';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css'
})
export class ItemListComponent implements OnInit {
  private readonly svc = inject(ItemService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showModal = signal(false);
  readonly editing = signal<ItemDto | null>(null);
  readonly items = signal<ItemDto[]>([]);
  readonly pagination = signal<PaginationMeta | null>(null);
  readonly currentPage = signal(1);

  readonly form = this.fb.group({
    id: [''],
    nombre: ['', Validators.required],
    descripcion: [''],
    // Controles para el modificador inicial
    estadisticaAfectada: [0],
    valorAjustado: [0]
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll(this.currentPage(), 10).subscribe({
      next: (r) => { 
        this.items.set(r.data); 
        this.pagination.set(r.pagination); 
        this.loading.set(false); 
      },
      error: () => { 
        this.toast.error('Error cargando los items.'); 
        this.loading.set(false); 
      },
    });
  }

  changePage(p: number): void { this.currentPage.set(p); this.load(); }

  openModal(item?: ItemDto): void {
    this.editing.set(item ?? null);
    if (item) {
      this.form.patchValue({ id: item.id, nombre: item.nombre, descripcion: item.descripcion || '' });
    } else {
      this.form.reset({ estadisticaAfectada: 0, valorAjustado: 0 });
    }
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    
    this.saving.set(true);
    const formValue = this.form.getRawValue();
    const e = this.editing();

    if (e) {
      // Actualizar: solo requiere id, nombre y descripción
      const updateDto = { id: e.id, nombre: formValue.nombre, descripcion: formValue.descripcion };
      this.svc.update(e.id, updateDto as any).subscribe({
        next: () => this.handleSuccess('Item actualizado.'),
        error: () => this.handleError()
      });
    } else {
      // Crear: armamos el array de modificadores si seleccionó uno válido
      const modificadores = formValue.estadisticaAfectada && formValue.estadisticaAfectada > 0 
        ? [{ 
            estadisticaAfectada: Number(formValue.estadisticaAfectada), 
            valorAjustado: Number(formValue.valorAjustado) 
          }] 
        : [];

      const createDto = { 
        nombre: formValue.nombre, 
        descripcion: formValue.descripcion, 
        modificadores 
      };

      this.svc.create(createDto as any).subscribe({
        next: () => this.handleSuccess('Item forjado exitosamente.'),
        error: () => this.handleError()
      });
    }
  }

  delete(item: ItemDto): void {
    if (!confirm(`¿Eliminar permanentemente el item "${item.nombre}"?`)) return;
    this.svc.delete(item.id).subscribe({
      next: () => { this.toast.success('Item destruido.'); this.load(); },
      error: () => this.toast.error('Error al destruir el item.'),
    });
  }

  private handleSuccess(msg: string) {
    this.saving.set(false);
    this.toast.success(msg);
    this.closeModal();
    this.load();
  }

  private handleError() {
    this.saving.set(false);
    this.toast.error('Error al forjar o actualizar el item.');
  }
}