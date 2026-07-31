import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
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
    // GIVEN — localStorage vide
    // WHEN
    const service = createService();

    // THEN
    expect(service.getToken()).toBeNull();
  });

  // A2
  it('isAuthenticated retourne false sans token', () => {
    // GIVEN — localStorage vide
    // WHEN
    const service = createService();

    // THEN
    expect(service.isAuthenticated()).toBe(false);
  });

  // A3
  it('getToken restitue le token présent au démarrage', () => {
    // GIVEN — un token déjà en localStorage (rechargement de page)
    const token = makeJwt(futureExp());
    localStorage.setItem('auth_token', token);

    // WHEN
    const service = createService();

    // THEN — le signal est initialisé depuis le stockage
    expect(service.getToken()).toBe(token);
  });

  // A4
  it('isAuthenticated retourne true pour un token valide', () => {
    // GIVEN — token non expiré en localStorage
    const token = makeJwt(futureExp());
    localStorage.setItem('auth_token', token);

    // WHEN
    const service = createService();

    // THEN
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isLoggedIn()).toBe(true);
  });

  // A5
  it('saveToken rend le token lisible via getToken', () => {
    // GIVEN
    const service = createService();

    // WHEN
    service.saveToken('abc.def.ghi');

    // THEN
    expect(service.getToken()).toBe('abc.def.ghi');
  });

  // A12
  it("logout rend l'utilisateur déconnecté", () => {
    // GIVEN — utilisateur connecté
    const service = createService();
    service.saveToken(makeJwt(futureExp()));

    // WHEN
    service.logout();

    // THEN — token effacé et signal repassé à false
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  // A6
  it('isAuthenticated retourne false pour un token expiré', () => {
    // GIVEN — token dont l'exp est dans le passé
    const now = Date.now();
    jest.useFakeTimers().setSystemTime(now);
    const token = makeJwt(Math.floor(now / 1000) - 60);

    // WHEN
    const service = createService();
    service.saveToken(token);

    // THEN
    expect(service.isAuthenticated()).toBe(false);
  });

  // A7
  it('un token valide devient invalide après expiration', () => {
    // GIVEN — token valide 60 s
    const now = Date.now();
    jest.useFakeTimers().setSystemTime(now);
    const token = makeJwt(Math.floor(now / 1000) + 60);
    const service = createService();
    service.saveToken(token);
    expect(service.isAuthenticated()).toBe(true);

    // WHEN — l'horloge avance au-delà de l'expiration
    jest.setSystemTime(now + 61_000);
    service.logout();          // passage à null : vrai changement de valeur
    service.saveToken(token);  // re-pose : le computed se recalcule à l'horloge avancée

    // THEN
    expect(service.isAuthenticated()).toBe(false);
  });

  // A8
  it('token à 2 segments → non authentifié', () => {
    // GIVEN
    const service = createService();

    // WHEN — token malformé (2 segments au lieu de 3)
    service.saveToken('aaa.bbb');

    // THEN
    expect(service.isAuthenticated()).toBe(false);
  });

  // A9
  it('payload non-JSON → non authentifié', () => {
    // GIVEN — payload base64url décodable mais pas du JSON
    const payload = btoa('not-json').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const service = createService();

    // WHEN
    service.saveToken(`header.${payload}.signature`);

    // THEN
    expect(service.isAuthenticated()).toBe(false);
  });

  // A10
  it('payload sans claim exp → non authentifié', () => {
    // GIVEN
    const service = createService();

    // WHEN — JWT bien formé mais sans claim exp
    service.saveToken(makeJwt());

    // THEN
    expect(service.isAuthenticated()).toBe(false);
  });

  // A11
  it('décode un payload base64url avec caractères accentués', () => {
    // GIVEN — claim contenant de l'UTF-8 multi-octets
    const token = makeJwt(futureExp(), { name: 'Émilie Nuñez' });
    const service = createService();

    // WHEN
    service.saveToken(token);

    // THEN — le décodage aboutit, le token est reconnu valide
    expect(service.isAuthenticated()).toBe(true);
  });

  // A13
  it('login émet un POST /api/login avec les identifiants', () => {
    // GIVEN
    const service = createService();
    const credentials: Login = { login: 'jdoe', password: 'pwd' };

    // WHEN
    service.login(credentials).subscribe();

    // THEN — 1 POST /api/login portant les identifiants
    const req = httpTesting.expectOne('/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush('fake.jwt.token');
  });

  // A14
  it('login mappe la réponse texte en {token}', () => {
    // GIVEN — le back renvoie le JWT brut en text/plain
    const service = createService();
    let response: LoginResponse | undefined;

    // WHEN
    service.login({ login: 'jdoe', password: 'pwd' }).subscribe(res => (response = res));
    httpTesting.expectOne('/api/login').flush('fake.jwt.token');

    // THEN — la chaîne est enveloppée dans un LoginResponse
    expect(response).toEqual({ token: 'fake.jwt.token' });
  });

  // A52
  it('login propage le 401 sans enregistrer de token', () => {
    // GIVEN
    const service = createService();
    let error: HttpErrorResponse | undefined;

    // WHEN — identifiants refusés par le back
    service.login({ login: 'jdoe', password: 'mauvais' })
      .subscribe({ error: (err: HttpErrorResponse) => (error = err) });
    httpTesting.expectOne('/api/login').flush('Invalid credentials', {
      status: 401,
      statusText: 'Unauthorized',
    });

    // THEN — erreur propagée, aucun token conservé
    expect(error?.status).toBe(401);
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  // A53
  it('login propage une erreur réseau (back arrêté)', () => {
    // GIVEN
    const service = createService();
    let error: HttpErrorResponse | undefined;

    // WHEN — échec transport
    service.login({ login: 'jdoe', password: 'pwd' })
      .subscribe({ error: (err: HttpErrorResponse) => (error = err) });
    httpTesting.expectOne('/api/login').error(new ProgressEvent('error'));

    // THEN
    expect(error?.status).toBe(0);
  });

  // A54
  it('payload base64url de longueur invalide → non authentifié', () => {
    // GIVEN — longueur ≡ 1 (mod 4) : padding impossible, base64UrlDecode lève
    const service = createService();

    // WHEN
    service.saveToken('header.aaaaa.signature');

    // THEN — l'exception est absorbée par readExp, qui retourne null
    expect(service.isAuthenticated()).toBe(false);
  });

  // A55
  it('payload base64url nécessitant un seul « = » de padding est décodé', () => {
    // GIVEN — on cherche un payload dont l'encodage a une longueur ≡ 3 (mod 4)
    const exp = futureExp();
    let token = '';
    for (let i = 0; i < 8; i++) {
      const candidate = makeJwt(exp, { pad: 'x'.repeat(i) });
      if (candidate.split('.')[1].length % 4 === 3) {
        token = candidate;
        break;
      }
    }
    expect(token).not.toBe('');
    const service = createService();

    // WHEN
    service.saveToken(token);

    // THEN — un seul '=' suffit, le décodage aboutit
    expect(service.isAuthenticated()).toBe(true);
  });
});
