// src/app/core/services/player.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PersonajeDto, CrearPersonajeDto, InventarioDto } from '../models/player.models';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api`;

  // ─── Personajes ───
  // Obtiene el personaje de un usuario específico
  getPersonajeByUsuarioId(usuarioId: string): Observable<PersonajeDto> {
    return this.http.get<PersonajeDto>(`${this.apiUrl}/Personaje/usuario/${usuarioId}`);
  }

  crearPersonaje(dto: CrearPersonajeDto): Observable<PersonajeDto> {
    return this.http.post<PersonajeDto>(`${this.apiUrl}/Personaje`, dto);
  }

  // ─── Inventario ───
  // Obtiene el inventario de un personaje específico
  getInventarioByPersonajeId(personajeId: string): Observable<InventarioDto[]> {
    return this.http.get<InventarioDto[]>(`${this.apiUrl}/Inventario/personaje/${personajeId}`);
  }

  getPersonajeById(personajeId: string): Observable<PersonajeDto> {
    return this.http.get<PersonajeDto>(`${this.apiUrl}/Personaje/${personajeId}`);
  }
}
