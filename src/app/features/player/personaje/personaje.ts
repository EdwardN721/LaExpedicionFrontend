import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PlayerService } from '../../../core/services/player.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-personaje',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // 👈 Crucial para que funcionen los botones y el form
  templateUrl: './personaje.html'
})
export class PersonajeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private playerSvc = inject(PlayerService);
  private authSvc = inject(AuthService);
  private toast = inject(ToastService);

  // Signals de estado
  personaje = signal<any>(null);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);

  // Formulario reactivo blindado
  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]]
  });

  // 1. Esto se ejecuta automáticamente al abrir la pantalla
  ngOnInit(): void {
    this.cargarPersonaje();
  }

  // 2. Lógica para buscar si el usuario ya tiene a Apolo
  cargarPersonaje(): void {
    this.loading.set(true);
    
    const user: any = this.authSvc.currentUser();
    const usuarioId = user?.nameid || user?.sub || user?.id; // Atrapamos el ID en cualquier formato

    if (!usuarioId) {
      this.toast.error('No se detectó la sesión del jugador.');
      this.loading.set(false);
      return;
    }

    this.playerSvc.getPersonajeByUsuarioId(usuarioId).subscribe({
      next: (personaje) => {
        this.personaje.set(personaje); // Si existe, lo pintamos
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          // ¡Excelente! No tiene personaje, mostraremos el formulario
          this.personaje.set(null);
        } else {
          this.toast.error('Error de red al consultar el oráculo.');
        }
        this.loading.set(false);
      }
    });
  }

  // 3. Lógica para forjar un nuevo personaje
  crearPersonaje(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return; // El botón ignorará el clic si no hay 3 letras mínimo
    }

    const user: any = this.authSvc.currentUser();
    const usuarioId = user?.nameid || user?.sub || user?.id;

    if (!usuarioId) return;

    this.saving.set(true); // Enciende el spinner del botón
    
    // Objeto exacto que el Backend .NET está esperando
    const dto = {
      usuarioId: usuarioId,
      nombre: this.form.value.nombre
    };

    this.playerSvc.crearPersonaje(dto as any).subscribe({
      next: (nuevoPersonaje) => {
        this.toast.success('¡Has nacido en este mundo!');
        this.personaje.set(nuevoPersonaje); // Actualiza la pantalla instantáneamente
        this.saving.set(false);
      },
      error: (err) => {
        console.error('El Backend rechazó la creación:', err);
        this.toast.error('Fallo al invocar el personaje.');
        this.saving.set(false);
      }
    });
  }
}