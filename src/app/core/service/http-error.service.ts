import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

// Association code HTTP -> message métier propre à l'écran appelant
// (ex. { 404: 'Étudiant introuvable.' }).
export type ErrorMessageOverrides = Record<number, string>;

@Injectable({
  providedIn: 'root'
})
export class HttpErrorService {
  // Traduit un HttpErrorResponse en message affichable, factorisé pour tous les
  // écrans. Les `overrides` permettent à chaque écran d'ajuster un code précis.
  toUserMessage(error: HttpErrorResponse, overrides: ErrorMessageOverrides = {}): string {
    // 1) status 0 : aucune réponse HTTP (back arrêté, réseau coupé, CORS...).
    if (error.status === 0) {
      return overrides[0] ?? 'Serveur injoignable. Vérifiez que le back tourne sur http://localhost:8080.';
    }

    const serverMessage = this.extractServerMessage(error);

    // 2) Identifiants invalides : 401, ou 400 "Invalid credentials" (login).
    if (error.status === 401 || (error.status === 400 && serverMessage === 'Invalid credentials')) {
      return overrides[error.status] ?? 'Identifiants invalides.';
    }

    // 3) Override explicite pour ce code (ex. { 404: 'Étudiant introuvable.' }).
    const override = overrides[error.status];
    if (override) {
      return override;
    }

    // 4) 400 générique : message serveur si présent, sinon libellé de repli.
    if (error.status === 400) {
      return serverMessage ?? 'Requête invalide. Vérifiez les champs saisis.';
    }

    // 5) Défaut : message serveur si présent, sinon générique avec le code.
    return serverMessage ?? `Une erreur est survenue (code ${error.status}).`;
  }

  // Extrait le message renvoyé par le back (ErrorDetails.message). Gère les deux
  // formes de corps :
  //  - login (responseType:'text') : error.error est une chaîne, souvent un JSON
  //    sérialisé à parser ; sinon on renvoie le texte brut ;
  //  - autres appels (JSON) : error.error est déjà un objet { message, ... }.
  private extractServerMessage(error: HttpErrorResponse): string | null {
    const body = error.error;
    if (typeof body === 'string' && body.length > 0) {
      try {
        const parsed = JSON.parse(body) as { message?: unknown };
        return typeof parsed.message === 'string' ? parsed.message : null;
      } catch {
        return body;
      }
    }
    if (body && typeof body === 'object' && typeof (body as { message?: unknown }).message === 'string') {
      return (body as { message: string }).message;
    }
    return null;
  }
}
