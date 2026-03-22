import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const pw = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-rpg-bg px-4 py-12">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    w-[600px] h-[600px] bg-rpg-gold/5 rounded-full blur-3xl"></div>
      </div>

      <div class="relative w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="font-rpg text-4xl text-rpg-gold tracking-wider">
            La Expedición
          </h1>
          <p class="text-rpg-muted mt-2 text-sm">
            Crea tu cuenta de aventurero
          </p>
        </div>

        <div class="rpg-card shadow-gold-lg">
          <h2 class="font-rpg text-xl text-rpg-text mb-6 border-b border-rpg-border pb-3">
            Registrarse
          </h2>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <!-- User name -->
            <div class="mb-4">
              <label class="rpg-label" for="userName">Nombre de aventurero</label>
              <input
                id="userName"
                type="text"
                class="rpg-input"
                formControlName="userName"
                placeholder="Thorin Escudobronce"
                autocomplete="username"
              />
              @if (form.get('userName')?.invalid && form.get('userName')?.touched) {
                <p class="text-rpg-danger text-xs mt-1">
                  El nombre es obligatorio (mínimo 3 caracteres).
                </p>
              }
            </div>

            <!-- Email -->
            <div class="mb-4">
              <label class="rpg-label" for="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                class="rpg-input"
                formControlName="email"
                placeholder="aventurero@ejemplo.com"
                autocomplete="email"
              />
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="text-rpg-danger text-xs mt-1">
                  Introduce un correo válido.
                </p>
              }
            </div>

            <!-- Password -->
            <div class="mb-4">
              <label class="rpg-label" for="password">Contraseña</label>
              <input
                id="password"
                type="password"
                class="rpg-input"
                formControlName="password"
                placeholder="••••••••"
                autocomplete="new-password"
              />
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="text-rpg-danger text-xs mt-1">
                  Mínimo 6 caracteres, una mayúscula y un número.
                </p>
              }
            </div>

            <!-- Confirm password -->
            <div class="mb-6">
              <label class="rpg-label" for="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                class="rpg-input"
                formControlName="confirmPassword"
                placeholder="••••••••"
                autocomplete="new-password"
              />
              @if (form.errors?.['passwordMismatch'] && form.get('confirmPassword')?.touched) {
                <p class="text-rpg-danger text-xs mt-1">
                  Las contraseñas no coinciden.
                </p>
              }
            </div>

            @if (errorMsg()) {
              <div
                class="bg-rpg-danger/10 border border-rpg-danger/40 text-rpg-danger
                       rounded-lg px-4 py-3 text-sm mb-4"
              >
                {{ errorMsg() }}
              </div>
            }

            <button
              type="submit"
              class="btn-primary w-full flex items-center justify-center gap-2"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="inline-block w-4 h-4 border-2 border-rpg-bg/40
                             border-t-rpg-bg rounded-full animate-spin"></span>
                Creando cuenta…
              } @else {
                Forjar mi Destino
              }
            </button>
          </form>

          <p class="text-center text-rpg-muted text-sm mt-5">
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="text-rpg-gold hover:underline ml-1">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly form = this.fb.group(
    {
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);

    const { userName, email, password } = this.form.getRawValue();

    this.auth
      .register({ userName: userName!, email: email!, password: password! })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.toast.success(`Bienvenido, ${res.userName}! Tu aventura comienza.`);
          this.router.navigate(['/play']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMsg.set(
            err?.error?.message ?? 'No se pudo crear la cuenta. Inténtalo de nuevo.'
          );
        },
      });
  }
}
