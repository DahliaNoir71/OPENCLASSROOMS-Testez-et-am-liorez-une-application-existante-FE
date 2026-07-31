import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Register } from '../models/Register';

describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(UserService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // A15
  it("register émet un POST /api/register avec l'utilisateur", () => {
    const user: Register = { firstName: 'Ada', lastName: 'Lovelace', login: 'ada', password: 'pwd' };

    service.register(user).subscribe();

    const req = httpTesting.expectOne('/api/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);
    req.flush({});
  });

  // A16
  it('register émet la réponse du serveur', () => {
    const user: Register = { firstName: 'Ada', lastName: 'Lovelace', login: 'ada', password: 'pwd' };
    let response: unknown;

    service.register(user).subscribe(res => (response = res));

    const req = httpTesting.expectOne('/api/register');
    req.flush({});

    expect(response).toEqual({});
  });

  // A50
  it('register propage le 400 « login déjà utilisé »', () => {
    const user: Register = { firstName: 'Ada', lastName: 'Lovelace', login: 'ada', password: 'pwd' };
    let error: HttpErrorResponse | undefined;

    service.register(user).subscribe({ error: (err: HttpErrorResponse) => (error = err) });

    httpTesting.expectOne('/api/register').flush(
      { message: 'Login already used' },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect(error?.status).toBe(400);
    expect(error?.error).toEqual({ message: 'Login already used' });
  });

  // A51
  it('register propage une erreur réseau (status 0)', () => {
    const user: Register = { firstName: 'Ada', lastName: 'Lovelace', login: 'ada', password: 'pwd' };
    let error: HttpErrorResponse | undefined;

    service.register(user).subscribe({ error: (err: HttpErrorResponse) => (error = err) });

    httpTesting.expectOne('/api/register').error(new ProgressEvent('error'));

    expect(error?.status).toBe(0);
  });
});
