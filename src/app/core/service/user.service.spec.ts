import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Register } from '../models/Register';

describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;

  const user: Register = { firstName: 'Ada', lastName: 'Lovelace', login: 'ada', password: 'pwd' };

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

  // Smoke test hérité (sans identifiant de plan)
  it('should be created', () => {
    // GIVEN le TestBed configuré ci-dessus
    // WHEN on injecte le service
    // THEN il est instanciable
    expect(service).toBeTruthy();
  });

  // A15
  it("register émet un POST /api/register avec l'utilisateur", () => {
    // GIVEN un utilisateur à inscrire
    // WHEN
    service.register(user).subscribe();

    // THEN — 1 requête POST /api/register portant l'objet complet en body
    const req = httpTesting.expectOne('/api/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);
    req.flush({});
  });

  // A16
  it('register émet la réponse du serveur', () => {
    // GIVEN
    let response: unknown;

    // WHEN — le serveur répond 200 avec un corps vide
    service.register(user).subscribe(res => (response = res));
    httpTesting.expectOne('/api/register').flush({});

    // THEN — l'Observable émet ce corps tel quel
    expect(response).toEqual({});
  });

  // A50
  it('register propage le 400 « login déjà utilisé »', () => {
    // GIVEN
    let error: HttpErrorResponse | undefined;

    // WHEN — le serveur répond 400 avec un ErrorDetails
    service.register(user).subscribe({ error: (err: HttpErrorResponse) => (error = err) });
    httpTesting.expectOne('/api/register').flush(
      { message: 'Login already used' },
      { status: 400, statusText: 'Bad Request' }
    );

    // THEN — l'erreur est propagée sans transformation
    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect(error?.status).toBe(400);
    expect(error?.error).toEqual({ message: 'Login already used' });
  });

  // A51
  it('register propage une erreur réseau (status 0)', () => {
    // GIVEN
    let error: HttpErrorResponse | undefined;

    // WHEN — la requête échoue au niveau transport (back arrêté)
    service.register(user).subscribe({ error: (err: HttpErrorResponse) => (error = err) });
    httpTesting.expectOne('/api/register').error(new ProgressEvent('error'));

    // THEN — status 0, distinct d'une réponse HTTP d'erreur
    expect(error?.status).toBe(0);
  });
});
