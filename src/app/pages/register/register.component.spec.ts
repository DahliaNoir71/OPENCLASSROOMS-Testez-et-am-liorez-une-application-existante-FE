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
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    httpTesting.expectNone('/api/register');
  });

  // B6
  it("soumet l'inscription et navigue vers /login?registered=1", () => {
    setInputValue('input[formControlName="firstName"]', 'Ada');
    setInputValue('input[formControlName="lastName"]', 'Lovelace');
    setInputValue('input[formControlName="login"]', 'ada');
    setInputValue('input[formControlName="password"]', 'pwd');
    fixture.detectChanges();

    jest.spyOn(router, 'navigate');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    const req = httpTesting.expectOne('/api/register');
    expect(req.request.body).toEqual({ firstName: 'Ada', lastName: 'Lovelace', login: 'ada', password: 'pwd' });
    req.flush({});

    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { registered: '1' } });
  });

  // Remplit les quatre champs requis et soumet.
  const submitValidForm = (): void => {
    setInputValue('input[formControlName="firstName"]', 'Ada');
    setInputValue('input[formControlName="lastName"]', 'Lovelace');
    setInputValue('input[formControlName="login"]', 'ada');
    setInputValue('input[formControlName="password"]', 'pwd');
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('form') as HTMLFormElement)
      .dispatchEvent(new Event('submit'));
  };

  // B34
  it('400 → affiche « Ce login est déjà utilisé. » et ne navigue pas', () => {
    const navigate = jest.spyOn(router, 'navigate');

    submitValidForm();
    httpTesting.expectOne('/api/register')
      .flush({ message: 'Login already used' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(fixture.componentInstance.loading).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ce login est déjà utilisé.');
    expect(navigate).not.toHaveBeenCalled();
  });

  // B35
  it('back injoignable → affiche le message réseau', () => {
    submitValidForm();
    httpTesting.expectOne('/api/register').error(new ProgressEvent('error'));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Serveur injoignable.');
  });

  // B36
  it("onReset vide le formulaire et efface le message d'erreur", () => {
    submitValidForm();
    httpTesting.expectOne('/api/register')
      .flush({ message: 'Login already used' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    expect(fixture.componentInstance.errorMessage).not.toBeNull();

    (fixture.nativeElement.querySelector('button[type="reset"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.submitted).toBe(false);
    expect(fixture.componentInstance.errorMessage).toBeNull();
    expect(fixture.componentInstance.registerForm.get('login')?.value).toBeNull();
  });

  // B37
  it('expose les contrôles du formulaire via le getter form', () => {
    expect(Object.keys(fixture.componentInstance.form))
      .toEqual(['firstName', 'lastName', 'login', 'password']);
  });
});
