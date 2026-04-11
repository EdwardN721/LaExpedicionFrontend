import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ItemDto,
  CrearItemDto,
  ActualizarItemDto,
} from '../models/item.models';
import { PaginatedResponse, PaginationMeta } from '../models/pagination.models'

@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/Item`;

  getItems(params?: any): Observable<PaginatedResponse<ItemDto>> {
    return this.http.get<any>(this.apiUrl, {
      params
    }).pipe(
      map(res  => {
        return {
          data: res.data || [],
          pagination: {
            currentPage: res.metadata?.currentPage || 1,
            totalPages: res.metadata?.totalPages || 1,
            totalCount: res.metadata?.totalCount || 0,
            hasPrevious: res.metadata?.hasPrevious || false,
            hasNext: res.metadata?.hasNext || false
          }
        }
      })
    );
  }

  getById(id: string): Observable<ItemDto> {
    return this.http.get<ItemDto>(`${this.apiUrl}/${id}`);
  }

  create(formData: FormData): Observable<ItemDto> {
    return this.http.post<ItemDto>(`${this.apiUrl}`, formData);
  }

  update(id: string, formData: FormData): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
