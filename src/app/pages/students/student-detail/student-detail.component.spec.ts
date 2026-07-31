import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { StudentDetailComponent } from './student-detail.component';
import { Student } from '../../../core/models/Student';

describe('StudentDetailComponent', () => {
  let fixture: ComponentFixture<StudentDetailComponent>;
  let httpTesting: HttpTestingController;
  let snackBarOpen: jest.SpyInstance;
  let navigate: jest.SpyInstance;

  const setup = (id: string): ComponentFixture<StudentDetailComponent> => {
    // MatSnackBar est fourni par MatSnackBarModule, importé dans le scope du
    // composant standalone : un provider de TestBed ne le remplacerait pas.
    // On espionne donc le prototype, ce qui évite aussi de monter l'overlay CDK.
    snackBarOpen = jest
      .spyOn(MatSnackBar.prototype, 'open')
      .mockReturnValue({} as MatSnackBarRef<TextOnlySnackBar>);

    TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id }) } },
        },
      ],
    });
    const created = TestBed.createComponent(StudentDetailComponent);
    httpTesting = TestBed.inject(HttpTestingController);
    navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    return created;
  };

  // Charge le composant jusqu'à l'affichage d'un étudiant : état de départ
  // commun aux scénarios de suppression.
  const loadStudent = (student: Student): void => {
    fixture = setup(String(student.id));
    fixture.detectChanges();
    httpTesting.expectOne(`/api/students/${student.id}`).flush(student);
    fixture.detectChanges();
  };

  const textOf = (): string => (fixture.nativeElement as HTMLElement).textContent ?? '';

  afterEach(() => {
    jest.restoreAllMocks();
    httpTesting?.verify();
  });

  // B16
  it("charge l'étudiant de l'URL et l'affiche", () => {
    // GIVEN — URL /students/7
    fixture = setup('7');
    fixture.detectChanges();
    const student: Student = { id: 7, firstName: 'Ada', lastName: 'Lovelace' };

    // WHEN — le back renvoie l'étudiant
    httpTesting.expectOne('/api/students/7').flush(student);
    fixture.detectChanges();

    // THEN
    expect(textOf()).toContain('Ada');
    expect(textOf()).toContain('Lovelace');
  });

  // B22
  it('affiche le spinner pendant le chargement', () => {
    // GIVEN — requête en cours, pas encore de réponse
    fixture = setup('7');
    fixture.detectChanges();
    expect(fixture.componentInstance.loading).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector('mat-spinner')).not.toBeNull();

    // WHEN — la réponse arrive
    httpTesting.expectOne('/api/students/7').flush({ id: 7, firstName: 'Ada', lastName: 'Lovelace' });
    fixture.detectChanges();

    // THEN — le spinner disparaît
    expect(fixture.componentInstance.loading).toBe(false);
    expect((fixture.nativeElement as HTMLElement).querySelector('mat-spinner')).toBeNull();
  });

  // B23
  it('404 au chargement → affiche « Étudiant introuvable. »', () => {
    // GIVEN — URL /students/99, id inexistant
    fixture = setup('99');
    fixture.detectChanges();

    // WHEN
    httpTesting.expectOne('/api/students/99')
      .flush({ message: 'Student not found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    // THEN — override 404 de cet écran, aucun étudiant affiché
    expect(fixture.componentInstance.loading).toBe(false);
    expect(fixture.componentInstance.student).toBeNull();
    expect(textOf()).toContain('Étudiant introuvable.');
  });

  // B24
  it('back injoignable au chargement → affiche le message réseau', () => {
    // GIVEN
    fixture = setup('7');
    fixture.detectChanges();

    // WHEN — échec transport
    httpTesting.expectOne('/api/students/7').error(new ProgressEvent('error'));
    fixture.detectChanges();

    // THEN
    expect(textOf()).toContain('Serveur injoignable.');
  });

  // B25
  it('onDelete sans étudiant chargé → aucune requête', () => {
    // GIVEN — le chargement a échoué, `student` est null
    fixture = setup('99');
    fixture.detectChanges();
    httpTesting.expectOne('/api/students/99')
      .flush(null, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
    const confirmSpy = jest.spyOn(window, 'confirm');

    // WHEN
    fixture.componentInstance.onDelete();

    // THEN — sortie immédiate, pas même de confirmation
    expect(confirmSpy).not.toHaveBeenCalled();
    httpTesting.expectNone(req => req.method === 'DELETE');
  });

  // B26
  it('suppression annulée dans la confirmation → aucune requête DELETE', () => {
    // GIVEN — étudiant affiché, confirmation refusée
    loadStudent({ id: 7, firstName: 'Ada', lastName: 'Lovelace' });
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

    // WHEN
    fixture.componentInstance.onDelete();

    // THEN — la confirmation nomme l'étudiant, aucune requête ni navigation
    expect(confirmSpy).toHaveBeenCalledWith("Supprimer l'étudiant Ada Lovelace ?");
    httpTesting.expectNone(req => req.method === 'DELETE');
    expect(navigate).not.toHaveBeenCalled();
  });

  // B27
  it('suppression confirmée → DELETE, notification et retour à la liste', () => {
    // GIVEN — étudiant affiché, confirmation acceptée
    loadStudent({ id: 7, firstName: 'Ada', lastName: 'Lovelace' });
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    // WHEN — le back répond 204
    fixture.componentInstance.onDelete();
    const req = httpTesting.expectOne('/api/students/7');
    req.flush(null, { status: 204, statusText: 'No Content' });

    // THEN
    expect(req.request.method).toBe('DELETE');
    expect(snackBarOpen).toHaveBeenCalledWith('Étudiant supprimé.', 'Fermer', { duration: 3000 });
    expect(navigate).toHaveBeenCalledWith(['/students']);
  });

  // B28
  it('404 à la suppression → affiche « Étudiant introuvable. » et reste sur la page', () => {
    // GIVEN — étudiant supprimé entre-temps par un autre utilisateur
    loadStudent({ id: 7, firstName: 'Ada', lastName: 'Lovelace' });
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    // WHEN
    fixture.componentInstance.onDelete();
    httpTesting.expectOne('/api/students/7')
      .flush(null, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    // THEN — message affiché, ni notification de succès ni navigation
    expect(textOf()).toContain('Étudiant introuvable.');
    expect(snackBarOpen).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  // B29
  it('erreur serveur à la suppression → affiche le message du back', () => {
    // GIVEN
    loadStudent({ id: 7, firstName: 'Ada', lastName: 'Lovelace' });
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    // WHEN — le back répond 500 avec un ErrorDetails
    fixture.componentInstance.onDelete();
    httpTesting.expectOne('/api/students/7')
      .flush({ message: 'Suppression impossible.' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    // THEN
    expect(textOf()).toContain('Suppression impossible.');
    expect(navigate).not.toHaveBeenCalled();
  });
});
