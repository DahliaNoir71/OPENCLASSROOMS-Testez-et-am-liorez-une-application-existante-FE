import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { StudentService } from './student.service';
import { Student } from '../models/Student';
import { StudentRequest } from '../models/StudentRequest';

describe('StudentService', () => {
  let service: StudentService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StudentService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  // A17
  it('getAll émet GET /api/students et retourne la liste', () => {
    const students: Student[] = [
      { id: 1, firstName: 'Ada', lastName: 'Lovelace' },
      { id: 2, firstName: 'Grace', lastName: 'Hopper' },
    ];
    let result: Student[] | undefined;

    service.getAll().subscribe(res => (result = res));

    const req = httpTesting.expectOne('/api/students');
    expect(req.request.method).toBe('GET');
    req.flush(students);

    expect(result).toEqual(students);
  });

  // A18
  it("getById émet GET /api/students/1 et retourne l'étudiant", () => {
    const student: Student = { id: 1, firstName: 'Ada', lastName: 'Lovelace' };
    let result: Student | undefined;

    service.getById(1).subscribe(res => (result = res));

    const req = httpTesting.expectOne('/api/students/1');
    expect(req.request.method).toBe('GET');
    req.flush(student);

    expect(result).toEqual(student);
  });

  // A19
  it('create émet POST /api/students avec le payload', () => {
    const payload: StudentRequest = { firstName: 'Ada', lastName: 'Lovelace' };
    const created: Student = { id: 3, ...payload };
    let result: Student | undefined;

    service.create(payload).subscribe(res => (result = res));

    const req = httpTesting.expectOne('/api/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(created);

    expect(result).toEqual(created);
  });

  // A20
  it('update émet PUT /api/students/2 avec le payload', () => {
    const payload: StudentRequest = { firstName: 'Grace', lastName: 'Hopper' };
    const updated: Student = { id: 2, ...payload };
    let result: Student | undefined;

    service.update(2, payload).subscribe(res => (result = res));

    const req = httpTesting.expectOne('/api/students/2');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(updated);

    expect(result).toEqual(updated);
  });

  // A21
  it('delete émet DELETE /api/students/3', () => {
    let completed = false;

    service.delete(3).subscribe({ complete: () => (completed = true) });

    const req = httpTesting.expectOne('/api/students/3');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(completed).toBe(true);
  });
});
