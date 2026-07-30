import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
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
});
