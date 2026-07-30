import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';

// Garde « invité » : empêche un utilisateur DÉJÀ connecté d'accéder aux écrans
// publics ('', /login, /register) et le renvoie vers /students.
// Complémentaire d'authGuard : ils se déclenchent sur des états opposés et
// partagent la même source de vérité (isAuthenticated) -> pas de boucle.
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/students']);
};
