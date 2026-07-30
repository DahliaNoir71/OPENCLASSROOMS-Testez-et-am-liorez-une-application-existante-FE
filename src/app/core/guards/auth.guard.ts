import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';

// Garde fonctionnel : protège les routes étudiants. Si l'utilisateur n'est pas
// connecté, on le renvoie vers /login en mémorisant l'URL demandée (returnUrl)
// pour l'y ramener après connexion.
// On renvoie un UrlTree plutôt que d'appeler router.navigate() : cela évite les
// courses de navigation et laisse le routeur gérer la redirection proprement.
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
