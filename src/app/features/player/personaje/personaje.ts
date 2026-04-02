import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../core/services/player.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PersonajeDto } from '../../../core/models/player.models';
import { InventarioDto } from '../../../core/models/player.models';
import { EnumTipoItems } from '../../../core/models/item.models';

@Component({
  selector: 'app-personaje',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personaje.html'
})
export class PersonajeComponent implements OnInit {
  private playerService = inject(PlayerService);
  private inventarioService = inject(InventarioService);
  private toast = inject(ToastService);

  personaje = signal<PersonajeDto | null>(null);
  equipoActivo = signal<any[]>([]);
  loading = signal(true);
  tabActiva = signal<'base' | 'total'>('total');

  // 1. Extraemos los atributos originales
  poderBase = computed(() => {
    const p = this.personaje();
    if (!p) return { fuerza: 0, magia: 0, energia: 0, mana: 0, salud: 0 };
    return {
      fuerza: p.fuerza || 0,
      magia: p.magia || 0,
      energia: p.energia || 0,
      mana: p.mana || 0,
      salud: p.salud || 0
    };
  });

  // 2. Sumamos todo el poder que nos dan los ítems equipados
  bonoEquipo = computed(() => {
    const mods = { fuerza: 0, magia: 0, energia: 0, mana: 0, salud: 0 };

    this.equipoActivo().forEach(inv => {
      inv.item?.itemModificador?.forEach((mod: any) => {
        const stat = mod.estadisticaAfectada?.toLowerCase();
        if (stat === 'fuerza') mods.fuerza += mod.valorAjuste;
        if (stat === 'magia') mods.magia += mod.valorAjuste;
        if (stat === 'energia') mods.energia += mod.valorAjuste;
        if (stat === 'mana') mods.mana += mod.valorAjuste;
        if (stat === 'salud') mods.salud += mod.valorAjuste;
      });
    });

    const bonoNivel = ((this.personaje()?.nivel || 1) * 10);
    return { ...mods, bonoNivel };
  });

  poderTotal = computed(() => {
    const base = this.poderBase();
    const bono = this.bonoEquipo();
    return {
      fuerza: base.fuerza + bono.fuerza,
      magia: base.magia + bono.magia,
      energia: base.energia + bono.energia,
      mana: base.mana + bono.mana,
      salud: base.salud + bono.salud,
      bonoNivel: bono.bonoNivel
    };
  });

  slotsEquipo = computed(() => {
    const equipo = this.equipoActivo();
    return {
      casco: equipo.find(i => i.item?.tipoItem === EnumTipoItems.Casco),
      pechera: equipo.find(i => i.item?.tipoItem === EnumTipoItems.Pechera),
      pantalones: equipo.find(i => i.item?.tipoItem === EnumTipoItems.Pantalones),
      arma: equipo.find(i => i.item?.tipoItem === EnumTipoItems.ArmaUnaMano || i.item?.tipoItem === EnumTipoItems.ArmaDosManos),
      accesorio: equipo.find(i => i.item?.tipoItem === EnumTipoItems.Accesorio)
    };
  });

  ngOnInit(): void {
    this.cargarPersonaje();
  }

  cargarPersonaje(): void {
    const personajeId = localStorage.getItem('personajeActivoId');
    if (!personajeId) {
      this.toast.error('No hay personaje activo.');
      this.loading.set(false);
      return;
    }

    this.playerService.getPersonajeById(personajeId).subscribe({
      next: (data: PersonajeDto) => {
        this.personaje.set(data);

        // Pedimos su equipo
        this.inventarioService.getInventario(personajeId, 1, 50).subscribe({
          next: (res: any) => {
            const lista = res?.data || res?.items || res || [];
            const equipados = lista.filter((i: any) => i.equipado === true);
            this.equipoActivo.set(equipados);
            this.loading.set(false);
          },
          error: () => this.loading.set(false) // Termina de cargar aunque el inventario falle
        });

      },
      error: (err: any) => {
        console.error('Error al cargar personaje', err);
        this.toast.error('No se pudo cargar la información del héroe.'); // 👈 Buena práctica añadir esto
        this.loading.set(false);
      }
    });
  }
}
