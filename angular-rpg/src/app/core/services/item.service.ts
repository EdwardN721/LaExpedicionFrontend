import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateItemDto,
  Item,
  PaginationMeta,
} from '../models/item.models';

export interface PagedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/items`;

  getAll(page = 1, pageSize = 10): Observable<PagedResult<Item>> {
    const params = new HttpParams()
      .set('pageNumber', page)
      .set('pageSize', pageSize);

    return this.http
      .get<Item[]>(this.base, { params, observe: 'response' })
      .pipe(
        map((res: HttpResponse<Item[]>) => ({
          data: res.body ?? [],
          pagination: JSON.parse(
            res.headers.get('X-Pagination') ?? '{}'
          ) as PaginationMeta,
        }))
      );
  }

  create(dto: CreateItemDto): Observable<Item> {
    return this.http.post<Item>(this.base, dto);
  }

  update(id: number, dto: Partial<CreateItemDto>): Observable<Item> {
    return this.http.put<Item>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
