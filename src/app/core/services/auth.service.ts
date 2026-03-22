import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TokenPayload,
} from '../models/auth.models';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'rpg_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // ── Signals ────────────────────────────────────────────────────────────────
  private readonly _token = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );

  readonly token = this._token.asReadonly();

  readonly currentUser = computed<TokenPayload | null>(() => {
    const t = this._token();
    return t ? this._decodeToken(t) : null;
  });

  readonly isAuthenticated = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    // Check token expiry
    return user.exp * 1000 > Date.now();
  });

  readonly userRole = computed(() => this.currentUser()?.role ?? null);

  readonly userName = computed(
    () => this.currentUser()?.unique_name ?? null
  );

  // ── HTTP calls ─────────────────────────────────────────────────────────────
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, payload)
      .pipe(tap((res) => this._setToken(res.token)));
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, payload)
      .pipe(tap((res) => this._setToken(res.token)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    this.router.navigate(['/login']);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────
  private _setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }

  private _decodeToken(token: string): TokenPayload | null {
    try {
      const base64Payload = token.split('.')[1];
      const decoded = atob(base64Payload);
      return JSON.parse(decoded) as TokenPayload;
    } catch {
      return null;
    }
  }
}
