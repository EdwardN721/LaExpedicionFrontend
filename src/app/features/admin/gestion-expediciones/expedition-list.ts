import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpeditionService } from '../../../core/services/expedition.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ExpedicionDto, PaginationMeta } from '../../../core/models/expedition.models';

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

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showModal = signal(false);
  readonly editing = signal<ExpedicionDto | null>(null);
  readonly expeditions = signal<ExpedicionDto[]>([]);
  readonly pagination = signal<PaginationMeta | null>(null);
  readonly currentPage = signal(1);

  // Formulario ajustado a los nuevos DTOs
  readonly form = this.fb.group({
    id: [''], // Guardamos el Guid de forma oculta para el update
    nombre: ['', Validators.required],
    descripcion: [''],
    dinero: [0, [Validators.required, Validators.min(0)]],
    experiencia: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getExpediciones(this.currentPage(), 10).subscribe({
      next: (r) => { 
        this.expeditions.set(r.data); 
        this.pagination.set(r.pagination); 
        this.loading.set(false); 
      },
      error: () => { 
        this.toast.error('Error cargando expediciones.'); 
        this.loading.set(false); 
      },
    });
  }

  changePage(p: number): void { this.currentPage.set(p); this.load(); }

  openModal(exp?: ExpedicionDto): void {
    this.editing.set(exp ?? null);
    if (exp) {
      this.form.patchValue(exp);
    } else {
      this.form.reset({ dinero: 0, experiencia: 0 });
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
      // Actualizar (Mapeamos al DTO de actualización que requiere el ID)
      const updateDto = { ...formValue, id: e.id } as any; 
      this.svc.update(e.id, updateDto).subscribe({
        next: () => { this.handleSuccess('Expedición actualizada.'); },
        error: () => { this.handleError(); }
      });
    } else {
      // Crear (Eliminamos el ID del form porque es un CrearExpedicionDto)
      const { id, ...createDto } = formValue;
      this.svc.create(createDto as any).subscribe({
        next: () => { this.handleSuccess('Expedición creada.'); },
        error: () => { this.handleError(); }
      });
    }
  }

  delete(exp: ExpedicionDto): void {
    if (!confirm(`¿Eliminar la expedición "${exp.nombre}"?`)) return;
    this.svc.delete(exp.id).subscribe({
      next: () => { this.toast.success('Expedición eliminada.'); this.load(); },
      error: () => this.toast.error('Error al eliminar.'),
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
    this.toast.error('Error al guardar la expedición.');
  }
}