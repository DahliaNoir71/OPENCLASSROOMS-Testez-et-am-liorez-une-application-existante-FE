import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../service/auth.service';
import { makeJwt } from '../../../testing/jwt.helper';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpTesting.verify();
  });

  // A26
  it('ajoute Bearer sur un appel protégé', () => {
    const token = makeJwt();
    localStorage.setItem('auth_token', token);

    httpClient.get('/api/students').subscribe();

    const req = httpTesting.expectOne('/api/students');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush(null);
  });

  // A27
  it("n'ajoute pas de header sans token", () => {
    httpClient.get('/api/students').subscribe();

    const req = httpTesting.expectOne('/api/students');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush(null);
  });

  // A28
  it("n'ajoute pas de header sur /api/login", () => {
    localStorage.setItem('auth_token', makeJwt());

    httpClient.post('/api/login', {}).subscribe();

    const req = httpTesting.expectOne('/api/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush(null);
  });

  // A29
  it("n'ajoute pas de header sur /api/register", () => {
    localStorage.setItem('auth_token', makeJwt());

    httpClient.post('/api/register', {}).subscribe();

    const req = httpTesting.expectOne('/api/register');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush(null);
  });

  // Chemins d'erreur : seul un 401 sur un appel PROTÉGÉ déclenche la
  // déconnexion. L'erreur est toujours re-propagée à l'appelant.

  // A56
  it('401 sur un appel protégé : déconnecte et redirige vers /login', () => {
    localStorage.setItem('auth_token', makeJwt());
    const authService = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const logout = jest.spyOn(authService, 'logout');
    const navigate = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    let error: HttpErrorResponse | undefined;

    httpClient.get('/api/students').subscribe({ error: (err: HttpErrorResponse) => (error = err) });

    httpTesting.expectOne('/api/students')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: router.url } });
    expect(error?.status).toBe(401);
  });

  // A57
  it('401 sur /api/login : pas de déconnexion ni de redirection', () => {
    const authService = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const logout = jest.spyOn(authService, 'logout');
    const navigate = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    let error: HttpErrorResponse | undefined;

    httpClient.post('/api/login', {})
      .subscribe({ error: (err: HttpErrorResponse) => (error = err) });

    httpTesting.expectOne('/api/login')
      .flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });

    expect(logout).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(error?.status).toBe(401);
  });

  // A58
  it('erreur non-401 sur un appel protégé : propagée sans déconnexion', () => {
    localStorage.setItem('auth_token', makeJwt());
    const authService = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const logout = jest.spyOn(authService, 'logout');
    const navigate = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    let error: HttpErrorResponse | undefined;

    httpClient.get('/api/students').subscribe({ error: (err: HttpErrorResponse) => (error = err) });

    httpTesting.expectOne('/api/students')
      .flush({ message: 'boom' }, { status: 500, statusText: 'Internal Server Error' });

    expect(logout).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(error?.status).toBe(500);
  });
});
