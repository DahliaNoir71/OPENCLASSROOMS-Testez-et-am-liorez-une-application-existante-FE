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
    const { result } = runGuard(false);
    expect(result).toBe(true);
  });

  // A25
  it('guestGuard redirige un connecté vers /students', () => {
    const { result, router } = runGuard(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/students');
  });
});
