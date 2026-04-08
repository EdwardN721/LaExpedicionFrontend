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
    return this.http.get<ItemDto[]>(this.apiUrl, {
      params,
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<ItemDto[]>) => {
        const paginationHeader = response.headers.get('X-Pagination');
        let meta: PaginationMeta;

        if (paginationHeader) {
          const rawMeta = JSON.parse(paginationHeader);
          meta = {
            currentPage: rawMeta.CurrentPage ?? rawMeta.currentPage,
            totalPages: rawMeta.TotalPages ?? rawMeta.totalPages,
            totalCount: rawMeta.TotalCount ?? rawMeta.totalCount,
            hasPrevious: rawMeta.HasPrevious ?? rawMeta.hasPrevious,
            hasNext: rawMeta.HasNext ?? rawMeta.hasNext
          };
        } else {
          meta = { currentPage: 1, totalPages: 1, totalCount: response.body?.length || 0, hasPrevious: false, hasNext: false };
        }

        return {
          data: response.body || [],
          pagination: meta
        };
      })
    );
  }

  getById(id: string): Observable<ItemDto> {
    return this.http.get<ItemDto>(`${this.apiUrl}/Item/${id}`);
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
