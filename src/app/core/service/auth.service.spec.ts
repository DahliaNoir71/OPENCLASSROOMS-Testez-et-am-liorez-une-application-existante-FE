import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
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
});
