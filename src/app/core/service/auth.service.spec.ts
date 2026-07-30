import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { Login } from '../models/Login';
import { LoginResponse } from '../models/LoginResponse';
import { makeJwt } from '../../../testing/jwt.helper';

describe('AuthService', () => {
  let httpTesting: HttpTestingController;

  const createService = (): AuthService => {
    const service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
    return service;
  };

  const futureExp = (): number => Math.floor(Date.now() / 1000) + 3600;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
    httpTesting?.verify();
  });

  // A1
  it('getToken retourne null sans token initial', () => {
    const service = createService();
    expect(service.getToken()).toBeNull();
  });

  // A2
  it('isAuthenticated retourne false sans token', () => {
    const service = createService();
    expect(service.isAuthenticated()).toBe(false);
  });

  // A3
  it('getToken restitue le token présent au démarrage', () => {
    const token = makeJwt(futureExp());
    localStorage.setItem('auth_token', token);
    const service = createService();
    expect(service.getToken()).toBe(token);
  });

  // A4
  it('isAuthenticated retourne true pour un token valide', () => {
    const token = makeJwt(futureExp());
    localStorage.setItem('auth_token', token);
    const service = createService();
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isLoggedIn()).toBe(true);
  });

  // A5
  it('saveToken rend le token lisible via getToken', () => {
    const service = createService();
    service.saveToken('abc.def.ghi');
    expect(service.getToken()).toBe('abc.def.ghi');
  });

  // A12
  it("logout rend l'utilisateur déconnecté", () => {
    const service = createService();
    service.saveToken(makeJwt(futureExp()));
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  // A6
  it('isAuthenticated retourne false pour un token expiré', () => {
    const now = Date.now();
    jest.useFakeTimers().setSystemTime(now);
    const token = makeJwt(Math.floor(now / 1000) - 60);

    const service = createService();
    service.saveToken(token);
    expect(service.isAuthenticated()).toBe(false);
  });

  // A7
  it('un token valide devient invalide après expiration', () => {
    const now = Date.now();
    jest.useFakeTimers().setSystemTime(now);
    const token = makeJwt(Math.floor(now / 1000) + 60);

    const service = createService();
    service.saveToken(token);
    expect(service.isAuthenticated()).toBe(true);

    jest.setSystemTime(now + 61_000);
    service.logout();          // passage à null : vrai changement de valeur
    service.saveToken(token);  // re-pose : le computed se recalcule à l'horloge avancée
    expect(service.isAuthenticated()).toBe(false);
  });

  // A8
  it('token à 2 segments → non authentifié', () => {
    const service = createService();
    service.saveToken('aaa.bbb');
    expect(service.isAuthenticated()).toBe(false);
  });

  // A9
  it('payload non-JSON → non authentifié', () => {
    const payload = btoa('not-json').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const service = createService();
    service.saveToken(`header.${payload}.signature`);
    expect(service.isAuthenticated()).toBe(false);
  });

  // A10
  it('payload sans claim exp → non authentifié', () => {
    const service = createService();
    service.saveToken(makeJwt());
    expect(service.isAuthenticated()).toBe(false);
  });

  // A11
  it('décode un payload base64url avec caractères accentués', () => {
    const token = makeJwt(futureExp(), { name: 'Émilie Nuñez' });
    const service = createService();
    service.saveToken(token);
    expect(service.isAuthenticated()).toBe(true);
  });

  // A13
  it('login émet un POST /api/login avec les identifiants', () => {
    const service = createService();
    const credentials: Login = { login: 'jdoe', password: 'pwd' };

    service.login(credentials).subscribe();

    const req = httpTesting.expectOne('/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush('fake.jwt.token');
  });

  // A14
  it('login mappe la réponse texte en {token}', () => {
    const service = createService();
    let response: LoginResponse | undefined;

    service.login({ login: 'jdoe', password: 'pwd' }).subscribe(res => (response = res));

    const req = httpTesting.expectOne('/api/login');
    req.flush('fake.jwt.token');

    expect(response).toEqual({ token: 'fake.jwt.token' });
  });
});
