import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [provideRouter([])],
    });
  });

  // B1
  it("affiche les liens vers la connexion et l'inscription", () => {
    // GIVEN — page d'accueil publique, aucun état préalable
    const fixture = TestBed.createComponent(LandingComponent);

    // WHEN
    fixture.detectChanges();

    // THEN
    const nativeElement = fixture.nativeElement as HTMLElement;
    expect(nativeElement.querySelector('a[href="/login"]')).toBeTruthy();
    expect(nativeElement.querySelector('a[href="/register"]')).toBeTruthy();
  });
});
