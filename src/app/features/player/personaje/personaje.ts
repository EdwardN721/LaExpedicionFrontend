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
  templateUrl: `./personaje.html`,
  styleUrl: './personaje.css'
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
