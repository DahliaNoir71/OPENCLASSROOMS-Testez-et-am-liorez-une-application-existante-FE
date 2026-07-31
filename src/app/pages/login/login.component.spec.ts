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

  const submit = (): void =>
    (fixture.nativeElement.querySelector('form') as HTMLFormElement)
      .dispatchEvent(new Event('submit'));

  // Remplit le formulaire avec des identifiants valides puis soumet.
  const fillAndSubmit = (password = 'pwd'): void => {
    setInputValue('input[formControlName="login"]', 'jdoe');
    setInputValue('input[formControlName="password"]', password);
    fixture.detectChanges();
    submit();
  };

  afterEach(() => {
    httpTesting?.verify();
  });

  // B7
  it('affiche la bannière après inscription', () => {
    // GIVEN — arrivée depuis l'inscription (?registered=1)
    fixture = setup({ registered: '1' });

    // WHEN
    fixture.detectChanges();

    // THEN
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Compte créé. Connectez-vous.');
  });

  // B8
  it("n'affiche pas la bannière sans le paramètre", () => {
    // GIVEN — aucun query param
    fixture = setup();

    // WHEN
    fixture.detectChanges();

    // THEN
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Compte créé. Connectez-vous.');
  });

  // B9
  it('ne soumet rien si le formulaire est invalide', () => {
    // GIVEN — formulaire vierge, les deux champs sont requis
    fixture = setup();
    fixture.detectChanges();

    // WHEN
    submit();
    fixture.detectChanges();

    // THEN — aucune requête émise
    httpTesting.expectNone('/api/login');
  });

  // B10
  it('connexion réussie → navigue vers /students par défaut', () => {
    // GIVEN — identifiants valides, aucun returnUrl
    fixture = setup();
    fixture.detectChanges();
    jest.spyOn(router, 'navigateByUrl');

    // WHEN
    fillAndSubmit();
    const req = httpTesting.expectOne('/api/login');
    req.flush('fake.jwt.token');

    // THEN — POST portant les identifiants, puis redirection par défaut
    expect(req.request.body).toEqual({ login: 'jdoe', password: 'pwd' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/students');
  });

  // B11
  it('connexion réussie → navigue vers le returnUrl fourni', () => {
    // GIVEN — returnUrl posé par le guard
    fixture = setup({ returnUrl: '/students/5' });
    fixture.detectChanges();
    jest.spyOn(router, 'navigateByUrl');

    // WHEN
    fillAndSubmit();
    httpTesting.expectOne('/api/login').flush('fake.jwt.token');

    // THEN
    expect(router.navigateByUrl).toHaveBeenCalledWith('/students/5');
  });

  // B30
  it('401 → affiche « Identifiants invalides. » et ne navigue pas', () => {
    // GIVEN
    fixture = setup();
    fixture.detectChanges();
    const navigateByUrl = jest.spyOn(router, 'navigateByUrl');

    // WHEN — le back refuse les identifiants
    fillAndSubmit('mauvais');
    httpTesting.expectOne('/api/login')
      .flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    // THEN — message affiché, chargement terminé, pas de navigation
    expect(fixture.componentInstance.loading).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Identifiants invalides.');
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  // B31
  it('back injoignable → affiche le message réseau', () => {
    // GIVEN
    fixture = setup();
    fixture.detectChanges();

    // WHEN — échec transport
    fillAndSubmit();
    httpTesting.expectOne('/api/login').error(new ProgressEvent('error'));
    fixture.detectChanges();

    // THEN
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Serveur injoignable.');
  });

  // B32
  it("onReset vide le formulaire et efface le message d'erreur", () => {
    // GIVEN — un échec de connexion a laissé un message affiché
    fixture = setup();
    fixture.detectChanges();
    fillAndSubmit('mauvais');
    httpTesting.expectOne('/api/login')
      .flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();
    expect(fixture.componentInstance.errorMessage).not.toBeNull();

    // WHEN — clic sur Réinitialiser
    (fixture.nativeElement.querySelector('button[type="reset"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    // THEN — état de soumission, message et champs remis à zéro
    expect(fixture.componentInstance.submitted).toBe(false);
    expect(fixture.componentInstance.errorMessage).toBeNull();
    expect(fixture.componentInstance.loginForm.get('login')?.value).toBeNull();
  });

  // B33
  it('expose les contrôles du formulaire via le getter form', () => {
    // GIVEN
    fixture = setup();
    fixture.detectChanges();

    // WHEN
    const controls = Object.keys(fixture.componentInstance.form);

    // THEN — le getter expose exactement les deux contrôles attendus
    expect(controls).toEqual(['login', 'password']);
  });
});
