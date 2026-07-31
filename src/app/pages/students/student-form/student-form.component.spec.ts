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

  const submit = (): void =>
    (fixture.nativeElement.querySelector('form') as HTMLFormElement)
      .dispatchEvent(new Event('submit'));

  const textOf = (): string => (fixture.nativeElement as HTMLElement).textContent ?? '';

  // Monte le composant en mode édition avec un étudiant déjà chargé.
  const setupEditMode = (student: Student): void => {
    fixture = setup({ id: String(student.id) });
    fixture.detectChanges();
    httpTesting.expectOne(`/api/students/${student.id}`).flush(student);
    fixture.detectChanges();
  };

  afterEach(() => {
    jest.restoreAllMocks();
    httpTesting?.verify();
  });

  // B17
  it('mode création : aucun chargement initial', () => {
    // GIVEN — aucun param :id dans l'URL
    fixture = setup();

    // WHEN
    fixture.detectChanges();

    // THEN — pas de GET, champs vides, titre de création
    httpTesting.expectNone(req => req.url.startsWith('/api/students/'));
    const firstName = fixture.nativeElement.querySelector('#firstName') as HTMLInputElement;
    const lastName = fixture.nativeElement.querySelector('#lastName') as HTMLInputElement;
    expect(firstName.value).toBe('');
    expect(lastName.value).toBe('');
    expect(textOf()).toContain('Nouvel étudiant');
  });

  // B18
  it('mode édition : pré-remplit le formulaire', () => {
    // GIVEN — URL /students/4/edit
    fixture = setup({ id: '4' });
    fixture.detectChanges();
    const student: Student = { id: 4, firstName: 'Grace', lastName: 'Hopper' };

    // WHEN — le back renvoie l'étudiant
    httpTesting.expectOne('/api/students/4').flush(student);
    fixture.detectChanges();

    // THEN — champs pré-remplis, titre d'édition
    const firstName = fixture.nativeElement.querySelector('#firstName') as HTMLInputElement;
    const lastName = fixture.nativeElement.querySelector('#lastName') as HTMLInputElement;
    expect(firstName.value).toBe('Grace');
    expect(lastName.value).toBe('Hopper');
    expect(textOf()).toContain('Modifier un étudiant');
  });

  // B19
  it("refuse une saisie composée d'espaces", () => {
    // GIVEN — les deux champs ne contiennent que des espaces
    fixture = setup();
    fixture.detectChanges();
    setInputValue('#firstName', '   ');
    setInputValue('#lastName', '   ');
    fixture.detectChanges();

    // WHEN
    submit();
    fixture.detectChanges();

    // THEN — Validators.pattern(/\S/) bloque la soumission
    httpTesting.expectNone('/api/students');
  });

  // B20
  it('création : soumet le payload trimé et navigue vers le détail', () => {
    // GIVEN — saisie entourée d'espaces
    fixture = setup();
    fixture.detectChanges();
    setInputValue('#firstName', ' Ada ');
    setInputValue('#lastName', ' Lovelace ');
    fixture.detectChanges();
    jest.spyOn(router, 'navigate');

    // WHEN
    submit();
    const req = httpTesting.expectOne('/api/students');
    req.flush({ id: 9, firstName: 'Ada', lastName: 'Lovelace' });

    // THEN — POST avec un payload trimé, puis navigation vers le détail créé
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ firstName: 'Ada', lastName: 'Lovelace' });
    expect(router.navigate).toHaveBeenCalledWith(['/students', 9]);
  });

  // B21
  it('édition : soumet un PUT et navigue vers le détail', () => {
    // GIVEN — étudiant 4 chargé, nom modifié
    setupEditMode({ id: 4, firstName: 'Grace', lastName: 'Hopper' });
    setInputValue('#lastName', ' Hopper-Murray ');
    fixture.detectChanges();
    jest.spyOn(router, 'navigate');

    // WHEN
    submit();
    const req = httpTesting.expectOne('/api/students/4');
    req.flush({ id: 4, firstName: 'Grace', lastName: 'Hopper-Murray' });

    // THEN — PUT avec les valeurs trimées, puis navigation vers le détail
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ firstName: 'Grace', lastName: 'Hopper-Murray' });
    expect(router.navigate).toHaveBeenCalledWith(['/students', 4]);
  });

  // B41
  it('édition : 404 au chargement → affiche « Étudiant introuvable. »', () => {
    // GIVEN — URL /students/99/edit, id inexistant
    fixture = setup({ id: '99' });
    fixture.detectChanges();

    // WHEN
    httpTesting.expectOne('/api/students/99')
      .flush({ message: 'Student not found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    // THEN
    expect(fixture.componentInstance.loading).toBe(false);
    expect(textOf()).toContain('Étudiant introuvable.');
  });

  // B42
  it('édition : back injoignable au chargement → message réseau', () => {
    // GIVEN
    fixture = setup({ id: '4' });
    fixture.detectChanges();

    // WHEN — échec transport
    httpTesting.expectOne('/api/students/4').error(new ProgressEvent('error'));
    fixture.detectChanges();

    // THEN
    expect(textOf()).toContain('Serveur injoignable.');
  });

  // B43
  it('création : 400 du back → affiche le message de validation serveur', () => {
    // GIVEN — formulaire valide côté front, refusé côté back
    fixture = setup();
    fixture.detectChanges();
    setInputValue('#firstName', 'Ada');
    setInputValue('#lastName', 'Lovelace');
    fixture.detectChanges();
    const navigate = jest.spyOn(router, 'navigate');

    // WHEN
    submit();
    httpTesting.expectOne('/api/students').flush(
      { message: 'lastName ne doit pas être vide' },
      { status: 400, statusText: 'Bad Request' }
    );
    fixture.detectChanges();

    // THEN — message serveur affiché, ni notification ni navigation
    expect(fixture.componentInstance.loading).toBe(false);
    expect(textOf()).toContain('lastName ne doit pas être vide');
    expect(navigate).not.toHaveBeenCalled();
    expect(snackBarOpen).not.toHaveBeenCalled();
  });

  // B44
  it('édition : 404 à la soumission → affiche « Étudiant introuvable. »', () => {
    // GIVEN — étudiant chargé puis supprimé entre-temps
    setupEditMode({ id: 4, firstName: 'Grace', lastName: 'Hopper' });
    const navigate = jest.spyOn(router, 'navigate');

    // WHEN
    submit();
    httpTesting.expectOne('/api/students/4')
      .flush(null, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    // THEN
    expect(textOf()).toContain('Étudiant introuvable.');
    expect(navigate).not.toHaveBeenCalled();
  });

  // B45
  it('création : notification « Étudiant créé. » au succès', () => {
    // GIVEN
    fixture = setup();
    fixture.detectChanges();
    setInputValue('#firstName', 'Ada');
    setInputValue('#lastName', 'Lovelace');
    fixture.detectChanges();

    // WHEN
    submit();
    httpTesting.expectOne('/api/students').flush({ id: 9, firstName: 'Ada', lastName: 'Lovelace' });

    // THEN — libellé propre au mode création
    expect(snackBarOpen).toHaveBeenCalledWith('Étudiant créé.', 'Fermer', { duration: 3000 });
  });

  // B46
  it('édition : notification « Étudiant mis à jour. » au succès', () => {
    // GIVEN
    setupEditMode({ id: 4, firstName: 'Grace', lastName: 'Hopper' });

    // WHEN
    submit();
    httpTesting.expectOne('/api/students/4')
      .flush({ id: 4, firstName: 'Grace', lastName: 'Hopper' });

    // THEN — libellé propre au mode édition
    expect(snackBarOpen).toHaveBeenCalledWith('Étudiant mis à jour.', 'Fermer', { duration: 3000 });
  });

  // B47
  it("onReset vide le formulaire et efface le message d'erreur", () => {
    // GIVEN — un échec serveur a laissé un message affiché
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

    // WHEN
    fixture.componentInstance.onReset();
    fixture.detectChanges();

    // THEN
    expect(fixture.componentInstance.submitted).toBe(false);
    expect(fixture.componentInstance.errorMessage).toBeNull();
    expect(fixture.componentInstance.studentForm.get('firstName')?.value).toBeNull();
  });

  // B48
  it('expose les contrôles du formulaire via le getter form', () => {
    // GIVEN
    fixture = setup();
    fixture.detectChanges();

    // WHEN
    const controls = Object.keys(fixture.componentInstance.form);

    // THEN — le getter expose exactement les deux contrôles attendus
    expect(controls).toEqual(['firstName', 'lastName']);
  });
});
