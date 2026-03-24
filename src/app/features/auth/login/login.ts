import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: `./login.html`,
  styleUrl: './login.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true); // El botón empieza a girar
    
    this.auth.login(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.loading.set(false); // 👈 ¡ESTO DETIENE EL GIRO DEL BOTÓN!
        this.toast.success('Bienvenido a La Expedición.');
        
        // Forzamos la redirección directa al juego para no depender del Rol por ahora
        this.router.navigate(['/play']); 
      },
      error: (err) => {
        this.loading.set(false); // Detiene el giro si hay error
        this.toast.error('Credenciales incorrectas.');
        console.error('Error de servidor:', err);
      }
    });
  }
}