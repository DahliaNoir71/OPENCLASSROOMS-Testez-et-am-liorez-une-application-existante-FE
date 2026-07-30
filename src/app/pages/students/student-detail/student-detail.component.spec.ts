import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { StudentDetailComponent } from './student-detail.component';
import { Student } from '../../../core/models/Student';

describe('StudentDetailComponent', () => {
  let fixture: ComponentFixture<StudentDetailComponent>;
  let httpTesting: HttpTestingController;

  const setup = (id: string): ComponentFixture<StudentDetailComponent> => {
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
    return created;
  };

  afterEach(() => httpTesting?.verify());

  // B16
  it("charge l'étudiant de l'URL et l'affiche", () => {
    fixture = setup('7');
    fixture.detectChanges();

    const student: Student = { id: 7, firstName: 'Ada', lastName: 'Lovelace' };
    httpTesting.expectOne('/api/students/7').flush(student);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Ada');
    expect(text).toContain('Lovelace');
  });
});
