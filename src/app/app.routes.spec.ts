import { Route } from '@angular/router';
import { routes } from './app.routes';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { StudentDetailComponent } from './pages/students/student-detail/student-detail.component';
import { StudentFormComponent } from './pages/students/student-form/student-form.component';
import { StudentListComponent } from './pages/students/student-list/student-list.component';

// La table de routage porte deux contrats non vérifiables par les tests de
// composants : les gardes attachés à chaque écran, et l'ORDRE des routes
// enfants ('new' avant ':id', ':id/edit' avant ':id'), qu'une réorganisation
// casserait silencieusement.
describe('app.routes', () => {
  const routeFor = (path: string): Route => {
    const route = routes.find(r => r.path === path);
    expect(route).toBeDefined();
    return route as Route;
  };

  // B49
  it('les écrans publics sont protégés par guestGuard', () => {
    // GIVEN la table de routage exportée par app.routes.ts
    // WHEN on inspecte les routes '', 'register' et 'login'
    // THEN chacune rend son composant et porte guestGuard
    expect(routeFor('').component).toBe(LandingComponent);
    expect(routeFor('').canActivate).toEqual([guestGuard]);
    expect(routeFor('register').component).toBe(RegisterComponent);
    expect(routeFor('register').canActivate).toEqual([guestGuard]);
    expect(routeFor('login').component).toBe(LoginComponent);
    expect(routeFor('login').canActivate).toEqual([guestGuard]);
  });

  // B50
  it('la section /students est protégée par authGuard', () => {
    // GIVEN la table de routage
    // WHEN on inspecte la route parente 'students'
    // THEN authGuard y est attaché (les enfants en héritent)
    expect(routeFor('students').canActivate).toEqual([authGuard]);
  });

  // B51
  it("les routes enfants de /students sont déclarées dans l'ordre attendu", () => {
    // GIVEN la route parente 'students'
    // WHEN on lit ses enfants
    const children = routeFor('students').children ?? [];

    // THEN l'ordre est '' → new → :id/edit → :id, chacun sur son composant
    expect(children.map(child => child.path)).toEqual(['', 'new', ':id/edit', ':id']);
    expect(children.map(child => child.component)).toEqual([
      StudentListComponent,
      StudentFormComponent,
      StudentFormComponent,
      StudentDetailComponent,
    ]);
  });

  // B52
  it("le repli ** redirige vers l'accueil et reste en dernier", () => {
    // GIVEN la table de routage
    // WHEN on inspecte la route joker
    // THEN elle redirige vers '' et occupe la dernière position
    expect(routeFor('**').redirectTo).toBe('');
    expect(routes[routes.length - 1].path).toBe('**');
  });
});
