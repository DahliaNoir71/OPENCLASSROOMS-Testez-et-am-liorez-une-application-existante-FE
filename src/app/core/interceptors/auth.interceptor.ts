import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';

// Routes publiques : ne pas y ajouter le Bearer, et ne pas intercepter leur
// 401/400 (ils appartiennent aux écrans login/register).
const AUTH_FREE_PATHS = ['/api/login', '/api/register'];

// Interceptor fonctionnel (Angular 15+) : à enregistrer via
// provideHttpClient(withInterceptors([authInterceptor])) dans app.config.ts.
// Il n'est PAS pris en compte par le token DI legacy HTTP_INTERCEPTORS.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthFree = AUTH_FREE_PATHS.some(path => req.url.startsWith(path));
  const token = authService.getToken();

  // Ajoute l'entête Authorization uniquement sur les appels protégés,
  // et seulement si un token est disponible.
  const authReq = (!isAuthFree && token)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 sur un appel protégé (token absent/expiré) : on déconnecte et on
      // renvoie vers le login. Le garde !isAuthFree évite toute boucle : un
      // échec de /api/login n'est jamais intercepté ici.
      if (error.status === 401 && !isAuthFree) {
        authService.logout();
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => error);
    })
  );
};
