import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let httpTesting: HttpTestingController;
  let router: Router;

  const setup = (queryParams: Record<string, string> = {}): ComponentFixture<LoginComponent> => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap(queryParams),
            },
          },
        },
      ],
    });
    const created = TestBed.createComponent(LoginComponent);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    return created;
  };

  const setInputValue = (selector: string, value: string): void => {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  afterEach(() => {
    httpTesting?.verify();
  });

  // B7
  it('affiche la bannière après inscription', () => {
    fixture = setup({ registered: '1' });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Compte créé. Connectez-vous.');
  });

  // B8
  it("n'affiche pas la bannière sans le paramètre", () => {
    fixture = setup();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Compte créé. Connectez-vous.');
  });

  // B9
  it('ne soumet rien si le formulaire est invalide', () => {
    fixture = setup();
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    httpTesting.expectNone('/api/login');
  });

  // B10
  it('connexion réussie → navigue vers /students par défaut', () => {
    fixture = setup();
    fixture.detectChanges();

    setInputValue('input[formControlName="login"]', 'jdoe');
    setInputValue('input[formControlName="password"]', 'pwd');
    fixture.detectChanges();

    jest.spyOn(router, 'navigateByUrl');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    const req = httpTesting.expectOne('/api/login');
    expect(req.request.body).toEqual({ login: 'jdoe', password: 'pwd' });
    req.flush('fake.jwt.token');

    expect(router.navigateByUrl).toHaveBeenCalledWith('/students');
  });

  // B11
  it('connexion réussie → navigue vers le returnUrl fourni', () => {
    fixture = setup({ returnUrl: '/students/5' });
    fixture.detectChanges();

    setInputValue('input[formControlName="login"]', 'jdoe');
    setInputValue('input[formControlName="password"]', 'pwd');
    fixture.detectChanges();

    jest.spyOn(router, 'navigateByUrl');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    const req = httpTesting.expectOne('/api/login');
    req.flush('fake.jwt.token');

    expect(router.navigateByUrl).toHaveBeenCalledWith('/students/5');
  });
});
