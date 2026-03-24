// src/app/core/services/item.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ItemDto, 
  CrearItemDto, 
  ActualizarItemDto, 
  PaginatedResponse 
} from '../models/item.models';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/Item`;

  getAll(page: number, limit: number): Observable<PaginatedResponse<ItemDto>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PaginatedResponse<ItemDto>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ItemDto> {
    return this.http.get<ItemDto>(`${this.apiUrl}/Item/${id}`);
  }

  create(dto: CrearItemDto): Observable<ItemDto> {
    return this.http.post<ItemDto>(`${this.apiUrl}/Item`, dto);
  }

  update(id: string, dto: ActualizarItemDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Item/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Item/${id}`);
  }
}