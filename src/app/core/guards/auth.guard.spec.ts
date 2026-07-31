import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../service/auth.service';

describe('authGuard', () => {
  const runGuard = (isAuth: boolean, url: string) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => isAuth } },
      ],
    });
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );
    return { result, router };
  };

  // A22
  it('authGuard autorise un utilisateur authentifié', () => {
    // GIVEN utilisateur authentifié, navigation vers /students
    // WHEN
    const { result } = runGuard(true, '/students');

    // THEN — accès accordé
    expect(result).toBe(true);
  });

  // A23
  it('authGuard redirige un invité vers /login avec returnUrl', () => {
    // GIVEN invité, navigation vers /students/5
    // WHEN
    const { result, router } = runGuard(false, '/students/5');

    // THEN — UrlTree vers /login portant l'URL demandée en returnUrl
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fstudents%2F5');
  });
});
