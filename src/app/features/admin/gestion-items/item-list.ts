import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ItemService} from '../../../core/services/item.service';
import {ToastService} from '../../../shared/services/toast.service';
import {ItemDto} from '../../../core/models/item.models';
import {PaginationMeta} from '../../../core/models/pagination.models';


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

  archivoSeleccionado: File | null = null;

  readonly form = this.fb.group({
    id: [''],
    nombre: ['', Validators.required],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    tipoItem: [0, Validators.required],
    estadisticaAfectada: [0],
    valorAjustado: [0]
  });

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalCount = 0;
  hasNext = false;
  hasPrevious = false;

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems() {
    this.loading.set(true);

    const params = {
      PageNumber: this.currentPage,
      PageSize: this.pageSize
    };

    this.svc.getItems(params).subscribe({
      next: (res) => {
        this.items.set(res.data);

        this.currentPage = res.pagination.currentPage;
        this.totalPages = res.pagination.totalPages;
        this.totalCount = res.pagination.totalCount;
        this.hasNext = res.pagination.hasNext;
        this.hasPrevious = res.pagination.hasPrevious;

        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar los ítems');
        this.loading.set(false);
      }
    });
  }

  paginaAnterior() {
    if (this.hasPrevious) {
      this.currentPage--;
      this.loadItems();
    }
  }

  paginaSiguiente() {
    if (this.hasNext) {
      this.currentPage++;
      this.loadItems();
    }
  }

  openModal(item?: ItemDto): void {
    this.editing.set(item ?? null);
    this.archivoSeleccionado = null;

    if (item) {
      this.form.patchValue({
        id: item.id,
        nombre: item.nombre,
        descripcion: item.descripcion || '',
        precio: item.precio || 0,
        tipoItem: item.tipoItem || 0
      });
    } else {
      this.form.reset({estadisticaAfectada: 0, valorAjustado: 0, precio: 0, tipoItem: 0});
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.form.getRawValue();
    const e = this.editing();

    // CONSTRUCCIÓN DEL FORMDATA PARA C#
    const formData = new FormData();
    formData.append('nombre', formValue.nombre!);
    formData.append('descripcion', formValue.descripcion || '');
    formData.append('precio', formValue.precio?.toString() || '0');
    formData.append('tipoItem', formValue.tipoItem?.toString() || '0');

    // Adjuntamos la imagen a Azure
    if (this.archivoSeleccionado) {
      formData.append('imagenArchivo', this.archivoSeleccionado);
    }

    // Lógica para adjuntar modificadores (C# necesita que los arrays en FormData se manden con índices)
    if (!e && formValue.estadisticaAfectada && formValue.estadisticaAfectada > 0) {
      formData.append('modificadores[0].estadisticaAfectada', formValue.estadisticaAfectada.toString());
      formData.append('modificadores[0].valorAjustado', formValue.valorAjustado!.toString());
    }

    if (e) {
      // Editar
      this.svc.update(e.id!, formData).subscribe({
        next: () => this.handleSuccess('Ítem actualizado.'),
        error: () => this.handleError()
      });
    } else {
      // Crear
      this.svc.create(formData).subscribe({
        next: () => this.handleSuccess('Ítem forjado exitosamente.'),
        error: () => this.handleError()
      });
    }
  }

  delete(item: ItemDto): void {
    if (!confirm(`¿Eliminar permanentemente el item "${item.nombre}"?`)) return;
    this.svc.delete(item.id).subscribe({
      next: () => {
        this.toast.success('Item destruido.');
        this.loadItems();
      },
      error: () => this.toast.error('Error al destruir el item.'),
    });
  }

  private handleSuccess(msg: string) {
    this.saving.set(false);
    this.toast.success(msg);
    this.closeModal();
    this.loadItems();
  }

  private handleError() {
    this.saving.set(false);
    this.toast.error('Error al forjar o actualizar el item.');
  }
}
