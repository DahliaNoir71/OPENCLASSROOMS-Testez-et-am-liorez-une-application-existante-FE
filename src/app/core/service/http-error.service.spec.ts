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
    // GIVEN — aucune réponse HTTP (back arrêté, réseau coupé, CORS)
    const error = errorWith(0);

    // WHEN
    const message = service.toUserMessage(error);

    // THEN
    expect(message).toBe(
      'Serveur injoignable. Vérifiez que le back tourne sur http://localhost:8080.'
    );
  });

  // A31
  it("status 0 → l'override du code 0 prime sur le message par défaut", () => {
    // GIVEN
    const error = errorWith(0);

    // WHEN — l'écran appelant fournit son propre libellé pour le code 0
    const message = service.toUserMessage(error, { 0: 'Back indisponible.' });

    // THEN
    expect(message).toBe('Back indisponible.');
  });

  // A32
  it('401 → « Identifiants invalides. »', () => {
    // GIVEN
    const error = errorWith(401);

    // WHEN
    const message = service.toUserMessage(error);

    // THEN
    expect(message).toBe('Identifiants invalides.');
  });

  // A33
  it("401 → l'override du code 401 prime", () => {
    // GIVEN
    const error = errorWith(401);

    // WHEN
    const message = service.toUserMessage(error, { 401: 'Session expirée.' });

    // THEN
    expect(message).toBe('Session expirée.');
  });

  // A34
  it('400 « Invalid credentials » → « Identifiants invalides. »', () => {
    // GIVEN — le back renvoie ce message en 400 sur /api/login
    const error = errorWith(400, JSON.stringify({ message: 'Invalid credentials' }));

    // WHEN
    const message = service.toUserMessage(error);

    // THEN — traité comme un 401, pas comme une erreur de validation
    expect(message).toBe('Identifiants invalides.');
  });

  // A35
  it("400 « Invalid credentials » → l'override du code 400 prime", () => {
    // GIVEN
    const error = errorWith(400, JSON.stringify({ message: 'Invalid credentials' }));

    // WHEN
    const message = service.toUserMessage(error, { 400: 'Login ou mot de passe incorrect.' });

    // THEN
    expect(message).toBe('Login ou mot de passe incorrect.');
  });

  // A36
  it("404 → l'override de l'écran appelant est utilisé", () => {
    // GIVEN
    const error = errorWith(404);

    // WHEN
    const message = service.toUserMessage(error, { 404: 'Étudiant introuvable.' });

    // THEN
    expect(message).toBe('Étudiant introuvable.');
  });

  // A37
  it('404 sans override → message serveur du corps JSON', () => {
    // GIVEN — corps JSON déjà désérialisé par HttpClient
    const error = errorWith(404, { message: 'Student not found' });

    // WHEN
    const message = service.toUserMessage(error);

    // THEN
    expect(message).toBe('Student not found');
  });

  // A38
  it('404 sans override ni corps → message générique avec le code', () => {
    // GIVEN
    const error = errorWith(404);

    // WHEN
    const message = service.toUserMessage(error);

    // THEN
    expect(message).toBe('Une erreur est survenue (code 404).');
  });

  // A39
  it('400 générique avec message serveur → message serveur', () => {
    // GIVEN — erreur de validation Bean Validation
    const error = errorWith(400, { message: 'firstName ne doit pas être vide' });

    // WHEN
    const message = service.toUserMessage(error);

    // THEN
    expect(message).toBe('firstName ne doit pas être vide');
  });

  // A40
  it('400 générique sans message serveur → libellé de repli', () => {
    // GIVEN
    const error = errorWith(400);

    // WHEN
    const message = service.toUserMessage(error);

    // THEN
    expect(message).toBe('Requête invalide. Vérifiez les champs saisis.');
  });

  // A41
  it('corps texte non-JSON → le texte brut est renvoyé tel quel', () => {
    // GIVEN — réponse text/plain non parsable en JSON
    const error = errorWith(502, 'Bad Gateway');

    // WHEN
    const message = service.toUserMessage(error);

    // THEN
    expect(message).toBe('Bad Gateway');
  });

  // A42
  it("corps texte JSON dont « message » n'est pas une chaîne → repli générique", () => {
    // GIVEN
    const error = errorWith(500, JSON.stringify({ message: 42 }));

    // WHEN
    const message = service.toUserMessage(error);

    // THEN — un message non-textuel n'est jamais affiché tel quel
    expect(message).toBe('Une erreur est survenue (code 500).');
  });

  // A43
  it('corps texte vide → repli générique', () => {
    // GIVEN
    const error = errorWith(500, '');

    // WHEN
    const message = service.toUserMessage(error);

    // THEN
    expect(message).toBe('Une erreur est survenue (code 500).');
  });

  // A44
  it('corps objet sans champ « message » → repli générique', () => {
    // GIVEN
    const error = errorWith(500, { code: 'INTERNAL' });

    // WHEN
    const message = service.toUserMessage(error);

    // THEN
    expect(message).toBe('Une erreur est survenue (code 500).');
  });

  // A45
  it('500 avec message serveur → message serveur', () => {
    // GIVEN
    const error = errorWith(500, { message: 'Erreur interne du serveur' });

    // WHEN
    const message = service.toUserMessage(error);

    // THEN
    expect(message).toBe('Erreur interne du serveur');
  });
});
