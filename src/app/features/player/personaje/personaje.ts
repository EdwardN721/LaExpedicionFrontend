import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlayerService } from '../../../core/services/player.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PersonajeDto } from '../../../core/models/player.models';
import { CrearPersonajeDto } from '../../../core/models/player.models';

@Component({
  selector: 'app-personaje',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personaje.html',
  styleUrl: './personaje.css'
})
export class PersonajeComponent implements OnInit {
  private readonly playerSvc = inject(PlayerService);
  private readonly authSvc = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly personaje = signal<PersonajeDto | null>(null);

  readonly form = this.fb.group({
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]]
  });

  ngOnInit(): void {
    this.cargarPersonaje();
  }

  cargarPersonaje(): void {
    const usuarioId = this.authSvc.currentUser()?.sub; // Extraemos el ID del token JWT
    
    if (!usuarioId) {
      this.loading.set(false);
      return;
    }

    this.playerSvc.getPersonajeByUsuarioId(usuarioId).subscribe({
      next: (personaje) => {
        this.personaje.set(personaje);
        this.loading.set(false);
      },
      error: (err) => {
        // Si el backend devuelve 404, significa que aún no tiene personaje
        if (err.status === 404) {
          this.personaje.set(null);
        } else {
          this.toast.error('Error al consultar el oráculo (personaje).');
        }
        this.loading.set(false);
      }
    });
  }

  crearPersonaje(): void {
    if (this.form.invalid) return;
    
    const usuarioId = this.authSvc.currentUser()?.sub;
    if (!usuarioId) return;

    this.saving.set(true);
    const dto: CrearPersonajeDto = {
      usuarioId: usuarioId,
      nombreUsuario: this.form.value.nombreUsuario!
    };

    this.playerSvc.crearPersonaje(dto).subscribe({
      next: (nuevoPersonaje) => {
        this.toast.success('¡Has nacido en este mundo!');
        this.personaje.set(nuevoPersonaje);
        this.saving.set(false);
      },
      error: () => {
        this.toast.error('Fallo al invocar el personaje.');
        this.saving.set(false);
      }
    });
  }
}