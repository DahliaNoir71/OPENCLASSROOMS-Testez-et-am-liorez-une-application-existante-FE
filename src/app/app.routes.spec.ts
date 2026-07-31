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

// Le table de routage porte deux contrats non vérifiables par les tests de
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
    expect(routeFor('').component).toBe(LandingComponent);
    expect(routeFor('').canActivate).toEqual([guestGuard]);
    expect(routeFor('register').component).toBe(RegisterComponent);
    expect(routeFor('register').canActivate).toEqual([guestGuard]);
    expect(routeFor('login').component).toBe(LoginComponent);
    expect(routeFor('login').canActivate).toEqual([guestGuard]);
  });

  // B50
  it('la section /students est protégée par authGuard', () => {
    expect(routeFor('students').canActivate).toEqual([authGuard]);
  });

  // B51
  it("les routes enfants de /students sont déclarées dans l'ordre attendu", () => {
    const children = routeFor('students').children ?? [];

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
    expect(routeFor('**').redirectTo).toBe('');
    expect(routes[routes.length - 1].path).toBe('**');
  });
});
