import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AppComponent } from './app.component';
import { makeJwt } from '../testing/jwt.helper';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;

  const futureExp = (): number => Math.floor(Date.now() / 1000) + 3600;

  const setup = (): ComponentFixture<AppComponent> => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const created = TestBed.createComponent(AppComponent);
    router = TestBed.inject(Router);
    return created;
  };

  afterEach(() => {
    localStorage.clear();
  });

  // B2
  it('affiche la navbar invité sans token', () => {
    fixture = setup();
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    expect(nativeElement.textContent).toContain('Se connecter');
    expect(nativeElement.textContent).toContain("S'enregistrer");
    expect(nativeElement.querySelector('button')).toBeNull();
  });

  // B3
  it('affiche la navbar connectée avec un token valide', () => {
    localStorage.setItem('auth_token', makeJwt(futureExp()));
    fixture = setup();
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    expect(nativeElement.querySelector('a[href="/students"]')).toBeTruthy();
    expect(nativeElement.querySelector('button')).toBeTruthy();
    expect(nativeElement.textContent).not.toContain('Se connecter');
  });

  // B4
  it('le clic sur Déconnexion navigue vers /login et repasse la navbar en mode invité', () => {
    localStorage.setItem('auth_token', makeJwt(futureExp()));
    fixture = setup();
    fixture.detectChanges();

    jest.spyOn(router, 'navigate');
    const logoutButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    logoutButton.click();
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Se connecter');
  });
});
