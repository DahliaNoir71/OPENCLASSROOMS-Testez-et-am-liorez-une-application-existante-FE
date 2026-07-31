import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let httpTesting: HttpTestingController;
  let router: Router;

  const setInputValue = (selector: string, value: string): void => {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  const submit = (): void =>
    (fixture.nativeElement.querySelector('form') as HTMLFormElement)
      .dispatchEvent(new Event('submit'));

  // Remplit les quatre champs requis puis soumet.
  const fillAndSubmit = (): void => {
    setInputValue('input[formControlName="firstName"]', 'Ada');
    setInputValue('input[formControlName="lastName"]', 'Lovelace');
    setInputValue('input[formControlName="login"]', 'ada');
    setInputValue('input[formControlName="password"]', 'pwd');
    fixture.detectChanges();
    submit();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    fixture = TestBed.createComponent(RegisterComponent);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  // B5
  it('ne soumet rien si le formulaire est invalide', () => {
    // GIVEN — formulaire vierge, les quatre champs sont requis

    // WHEN
    submit();
    fixture.detectChanges();

    // THEN
    httpTesting.expectNone('/api/register');
  });

  // B6
  it("soumet l'inscription et navigue vers /login?registered=1", () => {
    // GIVEN
    jest.spyOn(router, 'navigate');

    // WHEN
    fillAndSubmit();
    const req = httpTesting.expectOne('/api/register');
    req.flush({});

    // THEN — POST portant les quatre champs, puis redirection avec la bannière
    expect(req.request.body).toEqual({ firstName: 'Ada', lastName: 'Lovelace', login: 'ada', password: 'pwd' });
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { registered: '1' } });
  });

  // B34
  it('400 → affiche « Ce login est déjà utilisé. » et ne navigue pas', () => {
    // GIVEN
    const navigate = jest.spyOn(router, 'navigate');

    // WHEN — le back refuse un login déjà pris
    fillAndSubmit();
    httpTesting.expectOne('/api/register')
      .flush({ message: 'Login already used' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    // THEN — override du code 400 propre à cet écran, pas de navigation
    expect(fixture.componentInstance.loading).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ce login est déjà utilisé.');
    expect(navigate).not.toHaveBeenCalled();
  });

  // B35
  it('back injoignable → affiche le message réseau', () => {
    // GIVEN — formulaire valide

    // WHEN — échec transport
    fillAndSubmit();
    httpTesting.expectOne('/api/register').error(new ProgressEvent('error'));
    fixture.detectChanges();

    // THEN
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Serveur injoignable.');
  });

  // B36
  it("onReset vide le formulaire et efface le message d'erreur", () => {
    // GIVEN — un échec a laissé un message affiché
    fillAndSubmit();
    httpTesting.expectOne('/api/register')
      .flush({ message: 'Login already used' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    expect(fixture.componentInstance.errorMessage).not.toBeNull();

    // WHEN
    (fixture.nativeElement.querySelector('button[type="reset"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    // THEN
    expect(fixture.componentInstance.submitted).toBe(false);
    expect(fixture.componentInstance.errorMessage).toBeNull();
    expect(fixture.componentInstance.registerForm.get('login')?.value).toBeNull();
  });

  // B37
  it('expose les contrôles du formulaire via le getter form', () => {
    // GIVEN le composant initialisé
    // WHEN
    const controls = Object.keys(fixture.componentInstance.form);

    // THEN — le getter expose exactement les quatre contrôles attendus
    expect(controls).toEqual(['firstName', 'lastName', 'login', 'password']);
  });
});
