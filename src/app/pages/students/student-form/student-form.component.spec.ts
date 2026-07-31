import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { StudentFormComponent } from './student-form.component';
import { Student } from '../../../core/models/Student';

describe('StudentFormComponent', () => {
  let fixture: ComponentFixture<StudentFormComponent>;
  let httpTesting: HttpTestingController;
  let router: Router;
  let snackBarOpen: jest.SpyInstance;

  const setup = (params: Record<string, string> = {}): ComponentFixture<StudentFormComponent> => {
    // MatSnackBar vient du scope du composant standalone (MatSnackBarModule) :
    // on espionne le prototype plutôt que de le remplacer par un provider,
    // ce qui évite aussi de monter l'overlay CDK dans jsdom.
    snackBarOpen = jest
      .spyOn(MatSnackBar.prototype, 'open')
      .mockReturnValue({} as MatSnackBarRef<TextOnlySnackBar>);

    TestBed.configureTestingModule({
      imports: [StudentFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(params) } },
        },
      ],
    });
    const created = TestBed.createComponent(StudentFormComponent);
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
    jest.restoreAllMocks();
    httpTesting?.verify();
  });

  // B17
  it('mode création : aucun chargement initial', () => {
    fixture = setup();
    fixture.detectChanges();

    httpTesting.expectNone(req => req.url.startsWith('/api/students/'));

    const firstName = fixture.nativeElement.querySelector('#firstName') as HTMLInputElement;
    const lastName = fixture.nativeElement.querySelector('#lastName') as HTMLInputElement;
    expect(firstName.value).toBe('');
    expect(lastName.value).toBe('');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nouvel étudiant');
  });

  // B18
  it('mode édition : pré-remplit le formulaire', () => {
    fixture = setup({ id: '4' });
    fixture.detectChanges();

    const student: Student = { id: 4, firstName: 'Grace', lastName: 'Hopper' };
    httpTesting.expectOne('/api/students/4').flush(student);
    fixture.detectChanges();

    const firstName = fixture.nativeElement.querySelector('#firstName') as HTMLInputElement;
    const lastName = fixture.nativeElement.querySelector('#lastName') as HTMLInputElement;
    expect(firstName.value).toBe('Grace');
    expect(lastName.value).toBe('Hopper');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Modifier un étudiant');
  });

  // B19
  it("refuse une saisie composée d'espaces", () => {
    fixture = setup();
    fixture.detectChanges();

    setInputValue('#firstName', '   ');
    setInputValue('#lastName', '   ');
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    httpTesting.expectNone('/api/students');
  });

  // B20
  it('création : soumet le payload trimé et navigue vers le détail', () => {
    fixture = setup();
    fixture.detectChanges();

    setInputValue('#firstName', ' Ada ');
    setInputValue('#lastName', ' Lovelace ');
    fixture.detectChanges();

    jest.spyOn(router, 'navigate');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    const req = httpTesting.expectOne('/api/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ firstName: 'Ada', lastName: 'Lovelace' });
    req.flush({ id: 9, firstName: 'Ada', lastName: 'Lovelace' });

    expect(router.navigate).toHaveBeenCalledWith(['/students', 9]);
  });

  // B21
  it('édition : soumet un PUT et navigue vers le détail', () => {
    fixture = setup({ id: '4' });
    fixture.detectChanges();

    const student: Student = { id: 4, firstName: 'Grace', lastName: 'Hopper' };
    httpTesting.expectOne('/api/students/4').flush(student);
    fixture.detectChanges();

    setInputValue('#lastName', ' Hopper-Murray ');
    fixture.detectChanges();

    jest.spyOn(router, 'navigate');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    const req = httpTesting.expectOne('/api/students/4');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ firstName: 'Grace', lastName: 'Hopper-Murray' });
    req.flush({ id: 4, firstName: 'Grace', lastName: 'Hopper-Murray' });

    expect(router.navigate).toHaveBeenCalledWith(['/students', 4]);
  });

  const submit = (): void =>
    (fixture.nativeElement.querySelector('form') as HTMLFormElement)
      .dispatchEvent(new Event('submit'));

  const textOf = (): string => (fixture.nativeElement as HTMLElement).textContent ?? '';

  // B41
  it('édition : 404 au chargement → affiche « Étudiant introuvable. »', () => {
    fixture = setup({ id: '99' });
    fixture.detectChanges();

    httpTesting.expectOne('/api/students/99')
      .flush({ message: 'Student not found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(fixture.componentInstance.loading).toBe(false);
    expect(textOf()).toContain('Étudiant introuvable.');
  });

  // B42
  it('édition : back injoignable au chargement → message réseau', () => {
    fixture = setup({ id: '4' });
    fixture.detectChanges();

    httpTesting.expectOne('/api/students/4').error(new ProgressEvent('error'));
    fixture.detectChanges();

    expect(textOf()).toContain('Serveur injoignable.');
  });

  // B43
  it('création : 400 du back → affiche le message de validation serveur', () => {
    fixture = setup();
    fixture.detectChanges();

    setInputValue('#firstName', 'Ada');
    setInputValue('#lastName', 'Lovelace');
    fixture.detectChanges();
    const navigate = jest.spyOn(router, 'navigate');

    submit();
    httpTesting.expectOne('/api/students').flush(
      { message: 'lastName ne doit pas être vide' },
      { status: 400, statusText: 'Bad Request' }
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.loading).toBe(false);
    expect(textOf()).toContain('lastName ne doit pas être vide');
    expect(navigate).not.toHaveBeenCalled();
    expect(snackBarOpen).not.toHaveBeenCalled();
  });

  // B44
  it('édition : 404 à la soumission → affiche « Étudiant introuvable. »', () => {
    fixture = setup({ id: '4' });
    fixture.detectChanges();
    httpTesting.expectOne('/api/students/4')
      .flush({ id: 4, firstName: 'Grace', lastName: 'Hopper' });
    fixture.detectChanges();

    const navigate = jest.spyOn(router, 'navigate');
    submit();

    httpTesting.expectOne('/api/students/4')
      .flush(null, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(textOf()).toContain('Étudiant introuvable.');
    expect(navigate).not.toHaveBeenCalled();
  });

  // B45
  it('création : notification « Étudiant créé. » au succès', () => {
    fixture = setup();
    fixture.detectChanges();

    setInputValue('#firstName', 'Ada');
    setInputValue('#lastName', 'Lovelace');
    fixture.detectChanges();

    submit();
    httpTesting.expectOne('/api/students').flush({ id: 9, firstName: 'Ada', lastName: 'Lovelace' });

    expect(snackBarOpen).toHaveBeenCalledWith('Étudiant créé.', 'Fermer', { duration: 3000 });
  });

  // B46
  it('édition : notification « Étudiant mis à jour. » au succès', () => {
    fixture = setup({ id: '4' });
    fixture.detectChanges();
    httpTesting.expectOne('/api/students/4')
      .flush({ id: 4, firstName: 'Grace', lastName: 'Hopper' });
    fixture.detectChanges();

    submit();
    httpTesting.expectOne('/api/students/4')
      .flush({ id: 4, firstName: 'Grace', lastName: 'Hopper' });

    expect(snackBarOpen).toHaveBeenCalledWith('Étudiant mis à jour.', 'Fermer', { duration: 3000 });
  });

  // B47
  it("onReset vide le formulaire et efface le message d'erreur", () => {
    fixture = setup();
    fixture.detectChanges();

    setInputValue('#firstName', 'Ada');
    setInputValue('#lastName', 'Lovelace');
    fixture.detectChanges();

    submit();
    httpTesting.expectOne('/api/students')
      .flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(fixture.componentInstance.errorMessage).not.toBeNull();

    fixture.componentInstance.onReset();
    fixture.detectChanges();

    expect(fixture.componentInstance.submitted).toBe(false);
    expect(fixture.componentInstance.errorMessage).toBeNull();
    expect(fixture.componentInstance.studentForm.get('firstName')?.value).toBeNull();
  });

  // B48
  it('expose les contrôles du formulaire via le getter form', () => {
    fixture = setup();
    fixture.detectChanges();

    expect(Object.keys(fixture.componentInstance.form)).toEqual(['firstName', 'lastName']);
  });
});
