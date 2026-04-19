import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';
import {ToastService} from '../../../shared/services/toast.service';
import {PlayerService} from '../../../core/services/player.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: `./login.html`,
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private playerService = inject(PlayerService);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = signal(false);
  submitted = signal(false);

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      if (this.auth.isAdmin) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/play/personaje']);
      }
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.loginForm.invalid) {
      this.toast.error('Por favor completa todos los campos correctamente.');
      return;
    }

    this.loading.set(true); // El botón empieza a girar

    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        if (this.auth.isAdmin) {
          this.toast.success('Bienvenido, Administrador.');
          this.router.navigate(['/admin/dashboard']);
          this.loading.set(false);
        } else {
          this.cargarPersonajeInicial();
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.toast.error('Credenciales inválidas o error de conexión.');
        this.loading.set(false);
      }
    });
  }

  private cargarPersonajeInicial() {
    const tokenPayload = this.auth.currentUser() as any;
    const userId = tokenPayload?.nameid || tokenPayload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    if (userId) {
      this.playerService.getPersonajeByUsuarioId(userId).subscribe({
        next: (res: any) => {
          let personajeData = null;

          if (Array.isArray(res) && res.length > 0) personajeData = res[0];
          else if (res && Array.isArray(res.$values) && res.$values.length > 0) personajeData = res.$values[0];
          else if (res && res.data && Array.isArray(res.data) && res.data.length > 0) personajeData = res.data[0];
          else if (res && res.id) personajeData = res;

          if (personajeData && personajeData.id) {
            // ✅ Encontramos el personaje, lo guardamos y le abrimos la puerta al juego
            localStorage.setItem('personajeActivoId', personajeData.id);
            this.toast.success(`¡Bienvenido de vuelta, ${personajeData.nombre}!`);
            this.router.navigate(['/play/personaje']);
          } else {
            // ❌ No tiene personaje, lo mandamos al campamento o pantalla de creación
            this.toast.warning('Aún no tienes un personaje listo para la aventura.');
            this.router.navigate(['/play/campamento']);
          }
          this.loading.set(false);
        },
        error: () => {
          this.toast.error('Iniciaste sesión, pero no pudimos cargar tu personaje.');
          this.loading.set(false);
        }
      });
    } else {
      this.toast.error('Error al validar la sesión del usuario.');
      this.loading.set(false);
    }
  }
}
