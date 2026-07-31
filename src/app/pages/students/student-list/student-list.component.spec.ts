import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { StudentListComponent } from './student-list.component';
import { Student } from '../../../core/models/Student';

describe('StudentListComponent', () => {
  let fixture: ComponentFixture<StudentListComponent>;
  let httpTesting: HttpTestingController;
  let snackBarOpen: jest.SpyInstance;

  const setup = (): ComponentFixture<StudentListComponent> => {
    // MatSnackBar vient du scope du composant standalone : on espionne le
    // prototype, ce qui évite aussi de monter l'overlay CDK dans jsdom.
    snackBarOpen = jest
      .spyOn(MatSnackBar.prototype, 'open')
      .mockReturnValue({} as MatSnackBarRef<TextOnlySnackBar>);

    TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const created = TestBed.createComponent(StudentListComponent);
    httpTesting = TestBed.inject(HttpTestingController);
    return created;
  };

  const textOf = (): string => (fixture.nativeElement as HTMLElement).textContent ?? '';

  const rowCount = (): number => fixture.nativeElement.querySelectorAll('tbody tr').length;

  afterEach(() => {
    jest.restoreAllMocks();
    httpTesting?.verify();
  });

  // B12
  it('charge et affiche la liste au démarrage', () => {
    // GIVEN — le back renverra deux étudiants
    fixture = setup();
    fixture.detectChanges();
    const students: Student[] = [
      { id: 1, firstName: 'Ada', lastName: 'Lovelace' },
      { id: 2, firstName: 'Grace', lastName: 'Hopper' },
    ];

    // WHEN
    httpTesting.expectOne('/api/students').flush(students);
    fixture.detectChanges();

    // THEN — une ligne par étudiant
    expect(rowCount()).toBe(2);
    expect(textOf()).toContain('Ada');
    expect(textOf()).toContain('Hopper');
  });

  // B13
  it("affiche l'état vide", () => {
    // GIVEN
    fixture = setup();
    fixture.detectChanges();

    // WHEN — le back renvoie une liste vide
    httpTesting.expectOne('/api/students').flush([]);
    fixture.detectChanges();

    // THEN
    expect(textOf()).toContain('Aucun étudiant.');
  });

  // B14
  it('suppression confirmée → DELETE puis re-fetch et rendu à jour', () => {
    // GIVEN — deux étudiants affichés, confirmation acceptée
    fixture = setup();
    fixture.detectChanges();
    const students: Student[] = [
      { id: 1, firstName: 'Ada', lastName: 'Lovelace' },
      { id: 2, firstName: 'Grace', lastName: 'Hopper' },
    ];
    httpTesting.expectOne('/api/students').flush(students);
    fixture.detectChanges();
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    // WHEN — clic sur Supprimer de la première ligne
    const deleteButtons = fixture.nativeElement.querySelectorAll('tbody tr button') as NodeListOf<HTMLButtonElement>;
    deleteButtons[0].click();
    const deleteReq = httpTesting.expectOne('/api/students/1');
    deleteReq.flush(null);
    httpTesting.expectOne('/api/students').flush([students[1]]);
    fixture.detectChanges();

    // THEN — DELETE émis, notification, liste rechargée
    expect(deleteReq.request.method).toBe('DELETE');
    expect(rowCount()).toBe(1);
    expect(snackBarOpen).toHaveBeenCalledWith('Étudiant supprimé.', 'Fermer', { duration: 3000 });
  });

  // B15
  it('suppression annulée → aucune requête', () => {
    // GIVEN — un étudiant affiché, confirmation refusée
    fixture = setup();
    fixture.detectChanges();
    httpTesting.expectOne('/api/students').flush([{ id: 1, firstName: 'Ada', lastName: 'Lovelace' }]);
    fixture.detectChanges();
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    // WHEN
    (fixture.nativeElement.querySelector('tbody tr button') as HTMLButtonElement).click();

    // THEN
    httpTesting.expectNone('/api/students/1');
  });

  // B38
  it('back injoignable au chargement → affiche le message réseau', () => {
    // GIVEN
    fixture = setup();
    fixture.detectChanges();

    // WHEN — échec transport
    httpTesting.expectOne('/api/students').error(new ProgressEvent('error'));
    fixture.detectChanges();

    // THEN — liste vide, chargement terminé, message affiché
    expect(fixture.componentInstance.loading).toBe(false);
    expect(fixture.componentInstance.students).toEqual([]);
    expect(textOf()).toContain('Serveur injoignable.');
  });

  // B39
  it('500 au chargement → affiche le message du back', () => {
    // GIVEN
    fixture = setup();
    fixture.detectChanges();

    // WHEN
    httpTesting.expectOne('/api/students')
      .flush({ message: 'Base indisponible.' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    // THEN
    expect(textOf()).toContain('Base indisponible.');
  });

  // B40
  it('404 à la suppression → affiche une erreur sans recharger la liste', () => {
    // GIVEN — un étudiant affiché, confirmation acceptée
    fixture = setup();
    fixture.detectChanges();
    httpTesting.expectOne('/api/students').flush([{ id: 1, firstName: 'Ada', lastName: 'Lovelace' }]);
    fixture.detectChanges();
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    // WHEN — le back répond 404 sur le DELETE
    (fixture.nativeElement.querySelector('tbody tr button') as HTMLButtonElement).click();
    httpTesting.expectOne('/api/students/1')
      .flush({ message: 'Student not found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    // THEN — message affiché, aucun re-fetch, liste inchangée
    expect(textOf()).toContain('Student not found');
    httpTesting.expectNone('/api/students');
    expect(rowCount()).toBe(1);
  });
});
