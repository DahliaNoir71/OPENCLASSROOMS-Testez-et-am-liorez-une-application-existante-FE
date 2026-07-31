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

  // Remplit le formulaire avec des identifiants valides et soumet.
  const submitValidForm = (): void => {
    setInputValue('input[formControlName="login"]', 'jdoe');
    setInputValue('input[formControlName="password"]', 'mauvais');
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('form') as HTMLFormElement)
      .dispatchEvent(new Event('submit'));
  };

  // B30
  it('401 → affiche « Identifiants invalides. » et ne navigue pas', () => {
    fixture = setup();
    fixture.detectChanges();
    const navigateByUrl = jest.spyOn(router, 'navigateByUrl');

    submitValidForm();
    httpTesting.expectOne('/api/login')
      .flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(fixture.componentInstance.loading).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Identifiants invalides.');
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  // B31
  it('back injoignable → affiche le message réseau', () => {
    fixture = setup();
    fixture.detectChanges();

    submitValidForm();
    httpTesting.expectOne('/api/login').error(new ProgressEvent('error'));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Serveur injoignable.');
  });

  // B32
  it('onReset vide le formulaire et efface le message d\'erreur', () => {
    fixture = setup();
    fixture.detectChanges();

    submitValidForm();
    httpTesting.expectOne('/api/login')
      .flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();
    expect(fixture.componentInstance.errorMessage).not.toBeNull();

    (fixture.nativeElement.querySelector('button[type="reset"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.submitted).toBe(false);
    expect(fixture.componentInstance.errorMessage).toBeNull();
    expect(fixture.componentInstance.loginForm.get('login')?.value).toBeNull();
  });

  // B33
  it('expose les contrôles du formulaire via le getter form', () => {
    fixture = setup();
    fixture.detectChanges();

    expect(Object.keys(fixture.componentInstance.form)).toEqual(['login', 'password']);
  });
});
