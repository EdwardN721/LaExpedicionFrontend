// src/app/core/services/expedition.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExpedicionDto, CrearExpedicionDto, ActualizarExpedicionDto, PaginatedResponse, PaginationMeta } from '../models/expedition.models';

@Injectable({ providedIn: 'root' })
export class ExpeditionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/Expedicion`; // Ajusta el endpoint según tu controlador en .NET

  getAll(page: number, limit: number): Observable<PaginatedResponse<ExpedicionDto>> {
    let params = new HttpParams().set('PageNumber', page).set('PageSize', limit);
    // observe: 'response' nos trae toda la respuesta HTTP, incluyendo los Headers
    return this.http.get<ExpedicionDto[]>(this.apiUrl, { params, observe: 'response' })
      .pipe(
        map((response: HttpResponse<ExpedicionDto[]>) => {
          // Extraemos el header X-Pagination
          const paginationHeader = response.headers.get('X-Pagination');
          const pagination: PaginationMeta = paginationHeader ? JSON.parse(paginationHeader) : null;
          
          return {
            data: response.body || [],
            pagination: pagination
          };
        })
      );
  }

  getById(id: string): Observable<ExpedicionDto> {
    return this.http.get<ExpedicionDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CrearExpedicionDto): Observable<ExpedicionDto> {
    return this.http.post<ExpedicionDto>(this.apiUrl, dto);
  }

  update(id: string, dto: ActualizarExpedicionDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}