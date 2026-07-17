import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MaterialModule } from '../../shared/material.module';
import { AuthService } from '../../core/service/auth.service';
import { Login } from '../../core/models/Login';
import { LoginResponse } from '../../core/models/LoginResponse';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  loginForm: FormGroup = new FormGroup({});

  // Les trois états explicites de l'écran, exposés au template :
  submitted: boolean = false;            // le formulaire a été soumis (affichage des erreurs de validation)
  loading: boolean = false;              // requête en cours (désactive le bouton)
  errorMessage: string | null = null;    // message d'erreur serveur lisible, ou null
  token: string | null = null;           // token reçu en cas de succès, ou null

  ngOnInit() {
    this.loginForm = this.formBuilder.group(
      {
        login: ['', Validators.required],
        password: ['', Validators.required]
      },
    );
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    // Réinitialise les états avant l'appel : on passe en "chargement" et on
    // efface un éventuel résultat précédent (erreur ou token).
    this.loading = true;
    this.errorMessage = null;
    this.token = null;

    const credentials: Login = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value
    };
    this.authService.login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: LoginResponse) => {
          // Succès : on conserve le token pour l'afficher (vérification manuelle).
          this.loading = false;
          this.token = response.token;
        },
        error: (error: HttpErrorResponse) => {
          // Échec : on traduit la réponse HTTP en message lisible.
          this.loading = false;
          this.errorMessage = this.buildErrorMessage(error);
        }
      });
  }

  onReset(): void {
    this.submitted = false;
    this.errorMessage = null;
    this.token = null;
    this.loginForm.reset();
  }

  // Traduit un HttpErrorResponse en message affichable.
  // Comportement réel du back (RestExceptionHandler) :
  //  - identifiants invalides => 400 avec message "Invalid credentials"
  //    (IllegalArgumentException), ou 401 (BadCredentialsException) le cas échéant ;
  //  - sinon on affiche le message renvoyé par le back s'il existe, à défaut un
  //    message générique incluant le code HTTP.
  private buildErrorMessage(error: HttpErrorResponse): string {
    // status 0 = aucune réponse HTTP : back arrêté, réseau coupé, CORS...
    if (error.status === 0) {
      return 'Serveur injoignable. Vérifiez que le back tourne sur http://localhost:8080.';
    }

    const serverMessage = this.extractServerMessage(error);

    // Identifiants invalides : 400 "Invalid credentials" ou 401.
    if (error.status === 401 || (error.status === 400 && serverMessage === 'Invalid credentials')) {
      return 'Identifiants invalides.';
    }
    if (error.status === 400) {
      return serverMessage ?? 'Requête invalide. Vérifiez les champs saisis.';
    }
    return serverMessage ?? `Une erreur est survenue (code ${error.status}).`;
  }

  // Extrait le message d'erreur renvoyé par le back (ErrorDetails.message).
  // Le service lisant en responseType:'text', le corps d'erreur JSON arrive sous
  // forme de chaîne : on tente de le parser ; s'il s'agit d'un texte brut
  // (ex. "Internal Server error"), on le renvoie tel quel.
  private extractServerMessage(error: HttpErrorResponse): string | null {
    const body = error.error;
    if (typeof body === 'string' && body.length > 0) {
      try {
        const parsed = JSON.parse(body);
        return typeof parsed?.message === 'string' ? parsed.message : null;
      } catch {
        return body;
      }
    }
    if (body && typeof body === 'object' && typeof body.message === 'string') {
      return body.message;
    }
    return null;
  }
}
