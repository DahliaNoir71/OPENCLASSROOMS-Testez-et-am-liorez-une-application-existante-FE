import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Login } from '../models/Login';
import { LoginResponse } from '../models/LoginResponse';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';

  // Source de vérité réactive : le JWT courant (ou null), initialisé depuis le
  // localStorage pour survivre à un rechargement de page (app client-only).
  private readonly _token = signal<string | null>(localStorage.getItem(AuthService.TOKEN_KEY));

  // Signal dérivé, lecture seule : vrai uniquement si un token est présent ET
  // non expiré. La navbar s'y abonne et réagit au login/logout sans rechargement.
  readonly isLoggedIn = computed<boolean>(() => this.isTokenValid(this._token()));

  constructor(private httpClient: HttpClient) { }

  login(credentials: Login): Observable<LoginResponse> {
    // responseType: 'text' car le back renvoie le JWT brut en text/plain.
    // URL via environment.apiUrl (relatif : proxy en dev, same-origin en prod).
    return this.httpClient
      .post(`${environment.apiUrl}/api/login`, credentials, { responseType: 'text' })
      .pipe(map(token => ({ token })));
  }

  // Conserve le JWT après un login réussi et met à jour le signal (-> navbar).
  saveToken(token: string): void {
    localStorage.setItem(AuthService.TOKEN_KEY, token);
    this._token.set(token);
  }

  // Renvoie le JWT courant (lit le signal, source unique), ou null.
  getToken(): string | null {
    return this._token();
  }

  // Déconnecte : supprime le JWT du stockage et met à jour le signal (-> navbar).
  logout(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    this._token.set(null);
  }

  // Utilisé par authGuard / guestGuard : même source de vérité que le signal.
  // Un token expiré ou illisible est traité comme déconnecté.
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  // ---- Validation d'expiration du JWT (sans dépendance externe) ----

  private isTokenValid(token: string | null): boolean {
    if (!token) {
      return false;
    }
    const exp = this.readExp(token);
    if (exp === null) {
      return false;                    // token malformé => considéré déconnecté
    }
    return exp * 1000 > Date.now();     // exp en secondes (epoch), Date.now() en ms
  }

  private readExp(token: string): number | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    try {
      const payload = JSON.parse(this.base64UrlDecode(parts[1])) as { exp?: unknown };
      return typeof payload.exp === 'number' ? payload.exp : null;
    } catch {
      return null;
    }
  }

  // atob ne gère PAS le base64url : on remplace -/_ par +// et on rajoute le
  // padding '='. atob renvoie du latin1 ; on ré-décode en UTF-8 (TextDecoder)
  // pour gérer d'éventuels caractères accentués dans un claim.
  private base64UrlDecode(input: string): string {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad === 2) {
      base64 += '==';
    } else if (pad === 3) {
      base64 += '=';
    } else if (pad === 1) {
      throw new Error('Invalid base64url string');
    }

    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
}
