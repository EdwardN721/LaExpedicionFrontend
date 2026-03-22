import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlayerService } from '../../../core/services/player.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Character } from '../../../core/models/player.models';

@Component({
  selector: 'app-personaje',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div class="md:col-span-1 rpg-card h-64 bg-rpg-border/40"></div>
          <div class="md:col-span-2 rpg-card h-64 bg-rpg-border/40"></div>
        </div>
      } @else if (!character()) {
        <!-- No character yet – creation form -->
        <div class="max-w-md mx-auto mt-16 text-center">
          <h2 class="font-rpg text-3xl text-rpg-gold mb-2">Tu aventura comienza aquí</h2>
          <p class="text-rpg-muted mb-8">
            Aún no tienes un personaje. Dale un nombre y comienza tu leyenda.
          </p>
          <div class="rpg-card">
            <form [formGroup]="createForm" (ngSubmit)="createCharacter()">
              <label class="rpg-label" for="charName">Nombre del personaje</label>
              <input
                id="charName"
                class="rpg-input mb-4"
                formControlName="nombre"
                placeholder="Ej: Aldric el Valiente"
              />
              <button
                type="submit"
                class="btn-primary w-full"
                [disabled]="creating()"
              >
                @if (creating()) {
                  <span class="inline-block w-4 h-4 border-2 border-rpg-bg/40
                               border-t-rpg-bg rounded-full animate-spin mr-2"></span>
                }
                Crear Personaje
              </button>
            </form>
          </div>
        </div>
      } @else {
        <!-- Character sheet -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Identity card -->
          <div class="rpg-card flex flex-col items-center text-center gap-3">
            <!-- Avatar placeholder -->
            <div class="w-24 h-24 rounded-full bg-rpg-border flex items-center justify-center
                        text-4xl font-rpg text-rpg-gold border-2 border-rpg-gold/50">
              {{ character()!.nombre.charAt(0) }}
            </div>
            <div>
              <h2 class="font-rpg text-2xl text-rpg-text">{{ character()!.nombre }}</h2>
              <span class="badge-gold mt-1">{{ character()!.etiqueta }}</span>
            </div>
            <div class="text-rpg-muted text-sm">Nivel {{ character()!.nivel }}</div>

            <!-- XP bar -->
            <div class="w-full">
              <div class="flex justify-between text-xs text-rpg-muted mb-1">
                <span>XP</span>
                <span>
                  {{ character()!.experiencia }} / {{ character()!.experienciaParaSiguienteNivel }}
                </span>
              </div>
              <div class="w-full bg-rpg-border rounded-full h-2">
                <div
                  class="bg-rpg-gold rounded-full h-2 transition-all"
                  [style.width.%]="xpPercent()"
                ></div>
              </div>
            </div>

            <!-- Gold -->
            <div class="flex items-center gap-2 text-rpg-gold font-medium">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" />
              </svg>
              {{ character()!.oro }} oro
            </div>
          </div>

          <!-- Stats -->
          <div class="lg:col-span-2 rpg-card">
            <h3 class="font-rpg text-lg text-rpg-text mb-4 border-b border-rpg-border pb-2">
              Estadísticas
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              @for (stat of statEntries(); track stat.label) {
                <div class="bg-rpg-bg rounded-lg p-4 text-center border border-rpg-border/50">
                  <p class="text-rpg-muted text-xs uppercase tracking-wider mb-1">
                    {{ stat.label }}
                  </p>
                  <p class="font-rpg text-2xl text-rpg-gold">{{ stat.value }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class PersonajeComponent implements OnInit {
  private readonly svc = inject(PlayerService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly creating = signal(false);
  readonly character = signal<Character | null>(null);

  readonly createForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    this.svc.getCharacter().subscribe({
      next: (c) => { this.character.set(c); this.loading.set(false); },
      error: (err) => {
        // 404 means no character yet
        if (err.status === 404) { this.character.set(null); }
        this.loading.set(false);
      },
    });
  }

  createCharacter(): void {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.creating.set(true);
    const { nombre } = this.createForm.getRawValue();
    this.svc.createCharacter({ nombre: nombre! }).subscribe({
      next: (c) => {
        this.character.set(c);
        this.creating.set(false);
        this.toast.success(`¡${c.nombre} ha nacido! Que comience la aventura.`);
      },
      error: () => { this.creating.set(false); this.toast.error('Error al crear el personaje.'); },
    });
  }

  xpPercent(): number {
    const c = this.character();
    if (!c) return 0;
    return Math.min((c.experiencia / c.experienciaParaSiguienteNivel) * 100, 100);
  }

  statEntries(): { label: string; value: number }[] {
    const s = this.character()?.estadisticas;
    if (!s) return [];
    return [
      { label: 'Fuerza', value: s.fuerza },
      { label: 'Magia', value: s.magia },
      { label: 'Defensa', value: s.defensa },
      { label: 'Agilidad', value: s.agilidad },
      { label: 'Salud', value: s.salud },
    ];
  }
}
