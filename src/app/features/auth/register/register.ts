import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    nombre: ['', Validators.required],
    primerApellido: ['', Validators.required],
    segundoApellido: [''],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const dto = this.form.getRawValue();

    this.auth.register(dto as any).subscribe({
      next: () => {
      this.toast.success('¡Registro exitoso! Por favor inicia sesión.');
      this.router.navigate(['/login']); // Lo mandamos al login
    },
      error: (err) => {
        this.loading.set(false);
        this.toast.error('Error al registrarse. Intenta con otro correo.');
        console.error(err);
      }
    });
  }
}