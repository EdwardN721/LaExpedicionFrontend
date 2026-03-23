import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventarioDto, CrearInventarioDto, ActualizarInventarioDto } from '../models/player.models';
import { PaginatedResponse, PaginationMeta } from '../models/item.models'; // Reutilizamos tu interfaz de paginación

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/Inventario`;

  // Lee el X-Pagination del header
  obtenerInventario(personajeId: string, page: number, limit: number): Observable<PaginatedResponse<InventarioDto>> {
    const params = new HttpParams().set('PageNumber', page).set('PageSize', limit);
    
    return this.http.get<InventarioDto[]>(`${this.apiUrl}/personaje/${personajeId}`, { params, observe: 'response' }).pipe(
      map((response: HttpResponse<InventarioDto[]>) => {
        const paginationHeader = response.headers.get('X-Pagination');
        return {
          data: response.body || [],
          pagination: paginationHeader ? JSON.parse(paginationHeader) : null
        };
      })
    );
  }

  agregarItem(dto: CrearInventarioDto): Observable<InventarioDto> {
    return this.http.post<InventarioDto>(`${this.apiUrl}/agregar`, dto);
  }

  actualizarInventario(id: string, dto: ActualizarInventarioDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  // Mecánicas de juego (Endpoints específicos)
  usarItem(id: string, usos: number = 1): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/usar?usos=${usos}`, {});
  }

  equiparItem(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/equipar`, {});
  }

  eliminarDelInventario(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}