import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateExpeditionDto,
  Expedition,
} from '../models/expedition.models';
import { PagedResult } from './item.service';

@Injectable({ providedIn: 'root' })
export class ExpeditionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/expediciones`;

  getAll(page = 1, pageSize = 10): Observable<PagedResult<Expedition>> {
    const params = new HttpParams()
      .set('pageNumber', page)
      .set('pageSize', pageSize);

    return this.http
      .get<Expedition[]>(this.base, { params, observe: 'response' })
      .pipe(
        map((res: HttpResponse<Expedition[]>) => ({
          data: res.body ?? [],
          pagination: JSON.parse(res.headers.get('X-Pagination') ?? '{}'),
        }))
      );
  }

  create(dto: CreateExpeditionDto): Observable<Expedition> {
    return this.http.post<Expedition>(this.base, dto);
  }

  update(id: number, dto: Partial<CreateExpeditionDto>): Observable<Expedition> {
    return this.http.put<Expedition>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
