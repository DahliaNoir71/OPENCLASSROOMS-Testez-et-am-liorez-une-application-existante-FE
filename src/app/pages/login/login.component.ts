import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { AuthService } from '../../core/service/auth.service';
import { HttpErrorService } from '../../core/service/http-error.service';
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private httpError = inject(HttpErrorService);
  loginForm: FormGroup = new FormGroup({});

  // États explicites de l'écran, exposés au template :
  submitted: boolean = false;            // formulaire soumis (affichage des erreurs de validation)
  loading: boolean = false;              // requête en cours (désactive le bouton)
  errorMessage: string | null = null;    // message d'erreur serveur lisible, ou null
  justRegistered: boolean = false;       // vient de s'inscrire (bannière de confirmation)

  ngOnInit() {
    // Bannière « compte créé » si on arrive depuis l'inscription (?registered=1).
    this.justRegistered = this.route.snapshot.queryParamMap.get('registered') === '1';

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
    // Réinitialise les états avant l'appel.
    this.loading = true;
    this.errorMessage = null;

    const credentials: Login = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value
    };
    this.authService.login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: LoginResponse) => {
          // Succès : on persiste le JWT (l'interceptor le rejouera sur les
          // appels protégés), puis on redirige vers la page demandée
          // (returnUrl posé par le Guard/interceptor) ou, à défaut, la liste.
          this.loading = false;
          this.authService.saveToken(response.token);
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/students';
          this.router.navigateByUrl(returnUrl);
        },
        error: (error: HttpErrorResponse) => {
          // Échec : on traduit la réponse HTTP en message lisible (factorisé).
          this.loading = false;
          this.errorMessage = this.httpError.toUserMessage(error);
        }
      });
  }

  onReset(): void {
    this.submitted = false;
    this.errorMessage = null;
    this.loginForm.reset();
  }
}
