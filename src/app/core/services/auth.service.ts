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
    localStorage.getItem(TOKEN_KEY),
  );

  readonly token = this._token.asReadonly();

  readonly currentUser = computed<TokenPayload | null>(() => {
    const t = this._token();
    return t ? this._decodeToken(t) : null;
  });

  readonly isAuthenticated = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    // Verifica si el token no ha expirado
    return user.exp * 1000 > Date.now();
  });

  readonly userRole = computed(() => this.currentUser()?.role ?? null);

  readonly userName = computed(() => this.currentUser()?.unique_name ?? null);

  // ── HTTP calls ─────────────────────────────────────────────────────────────
  login(payload: LoginRequest): Observable<any> {
    return this.http
      .post<any>(`${environment.apiUrl}/api/Auth/login`, payload)
      .pipe(
        tap((res) => {
          if (res.token) {
            this._setToken(res.token);
          }
        }),
      );
  }

  register(payload: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/Usuario`, payload);    
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
      if (!token || token.split('.').length !== 3) {
        return null;
      }

      // 1. Extraemos el texto en Base64Url y lo pasamos a Base64 normal
      let payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      
      // 2. ¡EL TRUCO MÁGICO! Rellenamos con "=" para que ningún navegador explote
      const pad = payloadBase64.length % 4;
      if (pad) {
        payloadBase64 += '='.repeat(4 - pad);
      }

      // 3. Decodificamos de forma segura
      const decodedText = window.atob(payloadBase64);
      const utf8Text = decodeURIComponent(
        decodedText.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );

      return JSON.parse(utf8Text) as TokenPayload;
    } catch (error) {
      console.error('El JWT falló al decodificarse:', error);
      return null;
    }
  }
  
}
