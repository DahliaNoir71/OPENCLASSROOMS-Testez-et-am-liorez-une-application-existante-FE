import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
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
    // GIVEN — le serveur renverra deux étudiants
    const students: Student[] = [
      { id: 1, firstName: 'Ada', lastName: 'Lovelace' },
      { id: 2, firstName: 'Grace', lastName: 'Hopper' },
    ];
    let result: Student[] | undefined;

    // WHEN
    service.getAll().subscribe(res => (result = res));
    const req = httpTesting.expectOne('/api/students');
    req.flush(students);

    // THEN — 1 GET /api/students, la liste est émise telle quelle
    expect(req.request.method).toBe('GET');
    expect(result).toEqual(students);
  });

  // A18
  it("getById émet GET /api/students/1 et retourne l'étudiant", () => {
    // GIVEN
    const student: Student = { id: 1, firstName: 'Ada', lastName: 'Lovelace' };
    let result: Student | undefined;

    // WHEN
    service.getById(1).subscribe(res => (result = res));
    const req = httpTesting.expectOne('/api/students/1');
    req.flush(student);

    // THEN
    expect(req.request.method).toBe('GET');
    expect(result).toEqual(student);
  });

  // A19
  it('create émet POST /api/students avec le payload', () => {
    // GIVEN
    const payload: StudentRequest = { firstName: 'Ada', lastName: 'Lovelace' };
    const created: Student = { id: 3, ...payload };
    let result: Student | undefined;

    // WHEN
    service.create(payload).subscribe(res => (result = res));
    const req = httpTesting.expectOne('/api/students');
    req.flush(created);

    // THEN — POST portant le payload, réponse émise avec l'id attribué
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(result).toEqual(created);
  });

  // A20
  it('update émet PUT /api/students/2 avec le payload', () => {
    // GIVEN
    const payload: StudentRequest = { firstName: 'Grace', lastName: 'Hopper' };
    const updated: Student = { id: 2, ...payload };
    let result: Student | undefined;

    // WHEN
    service.update(2, payload).subscribe(res => (result = res));
    const req = httpTesting.expectOne('/api/students/2');
    req.flush(updated);

    // THEN
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    expect(result).toEqual(updated);
  });

  // A21
  it('delete émet DELETE /api/students/3', () => {
    // GIVEN
    let completed = false;

    // WHEN — le serveur répond 204 sans corps
    service.delete(3).subscribe({ complete: () => (completed = true) });
    const req = httpTesting.expectOne('/api/students/3');
    req.flush(null);

    // THEN — DELETE émis, l'Observable complète sans erreur de parsing
    expect(req.request.method).toBe('DELETE');
    expect(completed).toBe(true);
  });

  // Chemins d'erreur : le service ne capture rien, il propage le
  // HttpErrorResponse aux composants qui le traduisent via HttpErrorService.

  // A46
  it('getById propage le 404 sans le transformer', () => {
    // GIVEN
    let error: HttpErrorResponse | undefined;

    // WHEN — le serveur répond 404 avec un ErrorDetails
    service.getById(99).subscribe({ error: (err: HttpErrorResponse) => (error = err) });
    httpTesting.expectOne('/api/students/99').flush(
      { message: 'Student not found' },
      { status: 404, statusText: 'Not Found' }
    );

    // THEN — statut et corps parviennent intacts à l'appelant
    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect(error?.status).toBe(404);
    expect(error?.error).toEqual({ message: 'Student not found' });
  });

  // A47
  it('create propage le 400 de validation', () => {
    // GIVEN — payload refusé par @NotBlank côté back
    let error: HttpErrorResponse | undefined;
    const payload: StudentRequest = { firstName: '', lastName: 'Lovelace' };

    // WHEN
    service.create(payload).subscribe({ error: (err: HttpErrorResponse) => (error = err) });
    httpTesting.expectOne('/api/students').flush(
      { message: 'firstName ne doit pas être vide' },
      { status: 400, statusText: 'Bad Request' }
    );

    // THEN
    expect(error?.status).toBe(400);
  });

  // A48
  it('delete propage une erreur réseau (status 0)', () => {
    // GIVEN
    let error: HttpErrorResponse | undefined;

    // WHEN — échec transport, aucune réponse HTTP
    service.delete(3).subscribe({ error: (err: HttpErrorResponse) => (error = err) });
    httpTesting.expectOne('/api/students/3').error(new ProgressEvent('error'));

    // THEN
    expect(error?.status).toBe(0);
  });

  // A49
  it('update propage le 404 sur un étudiant supprimé entre-temps', () => {
    // GIVEN
    let error: HttpErrorResponse | undefined;
    const payload: StudentRequest = { firstName: 'Grace', lastName: 'Hopper' };

    // WHEN
    service.update(2, payload).subscribe({ error: (err: HttpErrorResponse) => (error = err) });
    httpTesting.expectOne('/api/students/2').flush(null, { status: 404, statusText: 'Not Found' });

    // THEN
    expect(error?.status).toBe(404);
  });
});
