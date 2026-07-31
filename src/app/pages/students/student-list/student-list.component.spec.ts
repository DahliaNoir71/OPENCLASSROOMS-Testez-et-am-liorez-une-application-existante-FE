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

  afterEach(() => {
    jest.restoreAllMocks();
    httpTesting?.verify();
  });

  // B12
  it('charge et affiche la liste au démarrage', () => {
    fixture = setup();
    fixture.detectChanges();

    const students: Student[] = [
      { id: 1, firstName: 'Ada', lastName: 'Lovelace' },
      { id: 2, firstName: 'Grace', lastName: 'Hopper' },
    ];
    httpTesting.expectOne('/api/students').flush(students);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ada');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Hopper');
  });

  // B13
  it("affiche l'état vide", () => {
    fixture = setup();
    fixture.detectChanges();

    httpTesting.expectOne('/api/students').flush([]);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aucun étudiant.');
  });

  // B14
  it('suppression confirmée → DELETE puis re-fetch et rendu à jour', () => {
    fixture = setup();
    fixture.detectChanges();

    const students: Student[] = [
      { id: 1, firstName: 'Ada', lastName: 'Lovelace' },
      { id: 2, firstName: 'Grace', lastName: 'Hopper' },
    ];
    httpTesting.expectOne('/api/students').flush(students);
    fixture.detectChanges();

    jest.spyOn(window, 'confirm').mockReturnValue(true);

    const deleteButtons = fixture.nativeElement.querySelectorAll('tbody tr button') as NodeListOf<HTMLButtonElement>;
    deleteButtons[0].click();

    const deleteReq = httpTesting.expectOne('/api/students/1');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    httpTesting.expectOne('/api/students').flush([students[1]]);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(snackBarOpen).toHaveBeenCalledWith('Étudiant supprimé.', 'Fermer', { duration: 3000 });
  });

  // B15
  it('suppression annulée → aucune requête', () => {
    fixture = setup();
    fixture.detectChanges();

    const students: Student[] = [{ id: 1, firstName: 'Ada', lastName: 'Lovelace' }];
    httpTesting.expectOne('/api/students').flush(students);
    fixture.detectChanges();

    jest.spyOn(window, 'confirm').mockReturnValue(false);

    const deleteButton = fixture.nativeElement.querySelector('tbody tr button') as HTMLButtonElement;
    deleteButton.click();

    httpTesting.expectNone('/api/students/1');
  });

  const textOf = (): string => (fixture.nativeElement as HTMLElement).textContent ?? '';

  // B38
  it('back injoignable au chargement → affiche le message réseau', () => {
    fixture = setup();
    fixture.detectChanges();

    httpTesting.expectOne('/api/students').error(new ProgressEvent('error'));
    fixture.detectChanges();

    expect(fixture.componentInstance.loading).toBe(false);
    expect(fixture.componentInstance.students).toEqual([]);
    expect(textOf()).toContain('Serveur injoignable.');
  });

  // B39
  it('500 au chargement → affiche le message du back', () => {
    fixture = setup();
    fixture.detectChanges();

    httpTesting.expectOne('/api/students')
      .flush({ message: 'Base indisponible.' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(textOf()).toContain('Base indisponible.');
  });

  // B40
  it('404 à la suppression → affiche une erreur sans recharger la liste', () => {
    fixture = setup();
    fixture.detectChanges();

    const students: Student[] = [{ id: 1, firstName: 'Ada', lastName: 'Lovelace' }];
    httpTesting.expectOne('/api/students').flush(students);
    fixture.detectChanges();

    jest.spyOn(window, 'confirm').mockReturnValue(true);
    (fixture.nativeElement.querySelector('tbody tr button') as HTMLButtonElement).click();

    httpTesting.expectOne('/api/students/1')
      .flush({ message: 'Student not found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(textOf()).toContain('Student not found');
    // Pas de re-fetch : la liste affichée reste celle chargée initialement.
    httpTesting.expectNone('/api/students');
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
  });
});
