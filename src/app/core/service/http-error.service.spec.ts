import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpErrorService } from './http-error.service';

describe('HttpErrorService', () => {
  let service: HttpErrorService;

  // Le corps d'erreur varie selon l'appel : chaîne (login, responseType:'text')
  // ou objet JSON (autres endpoints). Le helper laisse passer les deux formes.
  const errorWith = (status: number, body: unknown = null): HttpErrorResponse =>
    new HttpErrorResponse({ status, error: body, url: '/api/students' });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [HttpErrorService] });
    service = TestBed.inject(HttpErrorService);
  });

  // A30
  it('status 0 → message « serveur injoignable »', () => {
    expect(service.toUserMessage(errorWith(0))).toBe(
      'Serveur injoignable. Vérifiez que le back tourne sur http://localhost:8080.'
    );
  });

  // A31
  it("status 0 → l'override du code 0 prime sur le message par défaut", () => {
    const message = service.toUserMessage(errorWith(0), { 0: 'Back indisponible.' });
    expect(message).toBe('Back indisponible.');
  });

  // A32
  it('401 → « Identifiants invalides. »', () => {
    expect(service.toUserMessage(errorWith(401))).toBe('Identifiants invalides.');
  });

  // A33
  it("401 → l'override du code 401 prime", () => {
    const message = service.toUserMessage(errorWith(401), { 401: 'Session expirée.' });
    expect(message).toBe('Session expirée.');
  });

  // A34
  it('400 « Invalid credentials » → « Identifiants invalides. »', () => {
    const error = errorWith(400, JSON.stringify({ message: 'Invalid credentials' }));
    expect(service.toUserMessage(error)).toBe('Identifiants invalides.');
  });

  // A35
  it("400 « Invalid credentials » → l'override du code 400 prime", () => {
    const error = errorWith(400, JSON.stringify({ message: 'Invalid credentials' }));
    expect(service.toUserMessage(error, { 400: 'Login ou mot de passe incorrect.' }))
      .toBe('Login ou mot de passe incorrect.');
  });

  // A36
  it("404 → l'override de l'écran appelant est utilisé", () => {
    const message = service.toUserMessage(errorWith(404), { 404: 'Étudiant introuvable.' });
    expect(message).toBe('Étudiant introuvable.');
  });

  // A37
  it('404 sans override → message serveur du corps JSON', () => {
    const error = errorWith(404, { message: 'Student not found' });
    expect(service.toUserMessage(error)).toBe('Student not found');
  });

  // A38
  it('404 sans override ni corps → message générique avec le code', () => {
    expect(service.toUserMessage(errorWith(404))).toBe('Une erreur est survenue (code 404).');
  });

  // A39
  it('400 générique avec message serveur → message serveur', () => {
    const error = errorWith(400, { message: 'firstName ne doit pas être vide' });
    expect(service.toUserMessage(error)).toBe('firstName ne doit pas être vide');
  });

  // A40
  it('400 générique sans message serveur → libellé de repli', () => {
    expect(service.toUserMessage(errorWith(400))).toBe(
      'Requête invalide. Vérifiez les champs saisis.'
    );
  });

  // A41
  it('corps texte non-JSON → le texte brut est renvoyé tel quel', () => {
    const error = errorWith(502, 'Bad Gateway');
    expect(service.toUserMessage(error)).toBe('Bad Gateway');
  });

  // A42
  it('corps texte JSON dont « message » n\'est pas une chaîne → repli générique', () => {
    const error = errorWith(500, JSON.stringify({ message: 42 }));
    expect(service.toUserMessage(error)).toBe('Une erreur est survenue (code 500).');
  });

  // A43
  it('corps texte vide → repli générique', () => {
    const error = errorWith(500, '');
    expect(service.toUserMessage(error)).toBe('Une erreur est survenue (code 500).');
  });

  // A44
  it('corps objet sans champ « message » → repli générique', () => {
    const error = errorWith(500, { code: 'INTERNAL' });
    expect(service.toUserMessage(error)).toBe('Une erreur est survenue (code 500).');
  });

  // A45
  it('500 avec message serveur → message serveur', () => {
    const error = errorWith(500, { message: 'Erreur interne du serveur' });
    expect(service.toUserMessage(error)).toBe('Erreur interne du serveur');
  });
});
