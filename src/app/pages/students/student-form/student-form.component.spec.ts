import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { StudentFormComponent } from './student-form.component';
import { Student } from '../../../core/models/Student';

describe('StudentFormComponent', () => {
  let fixture: ComponentFixture<StudentFormComponent>;
  let httpTesting: HttpTestingController;
  let router: Router;

  const setup = (params: Record<string, string> = {}): ComponentFixture<StudentFormComponent> => {
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
});
