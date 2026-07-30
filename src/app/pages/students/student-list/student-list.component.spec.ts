import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StudentListComponent } from './student-list.component';
import { Student } from '../../../core/models/Student';

describe('StudentListComponent', () => {
  let fixture: ComponentFixture<StudentListComponent>;
  let httpTesting: HttpTestingController;

  const setup = (): ComponentFixture<StudentListComponent> => {
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
});
