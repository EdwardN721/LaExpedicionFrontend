import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExpedicionRealizadaDto, EventoExpedicionDto } from '../models/expedition.models';
import { PaginatedResponse } from '../models/item.models';

@Injectable({ providedIn: 'root' })
export class ExpedicionRealizadaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/ExpedicionRealizada`;

  obtenerHistorial(personajeId: string, page: number, limit: number): Observable<PaginatedResponse<ExpedicionRealizadaDto>> {
    const params = new HttpParams().set('PageNumber', page).set('PageSize', limit);

    return this.http.get<ExpedicionRealizadaDto[]>(`${this.apiUrl}/${personajeId}/historial`, { params, observe: 'response' }).pipe(
      map((response: HttpResponse<ExpedicionRealizadaDto[]>) => {
        const paginationHeader = response.headers.get('X-Pagination');
        return {
          data: response.body || [],
          pagination: paginationHeader ? JSON.parse(paginationHeader) : null
        };
      })
    );
  }

  emprenderAventura(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, dto);  }

  obtenerEventoAleatorio(): Observable<EventoExpedicionDto> {
    return this.http.get<EventoExpedicionDto>(`${this.apiUrl}/evento-aleatorio`);
  }
}
