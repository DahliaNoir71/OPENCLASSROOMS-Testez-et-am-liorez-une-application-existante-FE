import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { guestGuard } from './guest.guard';
import { AuthService } from '../service/auth.service';

describe('guestGuard', () => {
  const runGuard = (isAuth: boolean) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => isAuth } },
      ],
    });
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    return { result, router };
  };

  // A24
  it('guestGuard autorise un invité', () => {
    // GIVEN utilisateur non authentifié
    // WHEN
    const { result } = runGuard(false);

    // THEN — accès accordé aux écrans publics
    expect(result).toBe(true);
  });

  // A25
  it('guestGuard redirige un connecté vers /students', () => {
    // GIVEN utilisateur déjà authentifié
    // WHEN
    const { result, router } = runGuard(true);

    // THEN — UrlTree vers /students
    expect(router.serializeUrl(result as UrlTree)).toBe('/students');
  });
});
