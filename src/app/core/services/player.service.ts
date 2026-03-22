import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdventureRecord,
  Character,
  CreateCharacterDto,
  InventoryItem,
} from '../models/player.models';
import { PagedResult } from './item.service';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api`;

  // ── Character ─────────────────────────────────────────────────────────────
  getCharacter(): Observable<Character> {
    return this.http.get<Character>(`${this.base}/personaje`);
  }

  createCharacter(dto: CreateCharacterDto): Observable<Character> {
    return this.http.post<Character>(`${this.base}/personaje`, dto);
  }

  // ── Inventory ─────────────────────────────────────────────────────────────
  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.base}/inventario`);
  }

  equipItem(inventoryItemId: number): Observable<void> {
    return this.http.post<void>(
      `${this.base}/inventario/${inventoryItemId}/equipar`,
      {}
    );
  }

  unequipItem(inventoryItemId: number): Observable<void> {
    return this.http.post<void>(
      `${this.base}/inventario/${inventoryItemId}/desequipar`,
      {}
    );
  }

  dropItem(inventoryItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/inventario/${inventoryItemId}`);
  }

  // ── Adventures ────────────────────────────────────────────────────────────
  startAdventure(expedicionId: number): Observable<AdventureRecord> {
    return this.http.post<AdventureRecord>(
      `${this.base}/expediciones/${expedicionId}/emprender`,
      {}
    );
  }

  getHistory(page = 1, pageSize = 10): Observable<PagedResult<AdventureRecord>> {
    const params = new HttpParams()
      .set('pageNumber', page)
      .set('pageSize', pageSize);

    return this.http
      .get<AdventureRecord[]>(`${this.base}/historial`, {
        params,
        observe: 'response',
      })
      .pipe(
        map((res: HttpResponse<AdventureRecord[]>) => ({
          data: res.body ?? [],
          pagination: JSON.parse(res.headers.get('X-Pagination') ?? '{}'),
        }))
      );
  }
}
