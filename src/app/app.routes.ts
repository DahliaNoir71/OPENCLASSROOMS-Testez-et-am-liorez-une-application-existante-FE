import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { StudentListComponent } from './pages/students/student-list/student-list.component';
import { StudentDetailComponent } from './pages/students/student-detail/student-detail.component';
import { StudentFormComponent } from './pages/students/student-form/student-form.component';

export const routes: Routes = [
  // Écrans publics : guestGuard renvoie les utilisateurs déjà connectés vers /students.
  { path: '', component: LandingComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  {
    // Toutes les routes étudiants sont protégées par authGuard (les enfants héritent).
    path: 'students',
    canActivate: [authGuard],
    children: [
      // Ordre important : 'new' avant ':id', et ':id/edit' avant ':id'.
      { path: '', component: StudentListComponent },
      { path: 'new', component: StudentFormComponent },
      { path: ':id/edit', component: StudentFormComponent },
      { path: ':id', component: StudentDetailComponent }
    ]
  },
  // Repli : renvoie vers l'accueil ('' -> landing pour un invité, /students pour un connecté via guestGuard).
  { path: '**', redirectTo: '' }
];
