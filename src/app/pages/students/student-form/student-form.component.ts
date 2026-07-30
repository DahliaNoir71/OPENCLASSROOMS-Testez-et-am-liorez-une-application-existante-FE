import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { HttpErrorService } from '../../../core/service/http-error.service';
import { Student } from '../../../core/models/Student';
import { StudentRequest } from '../../../core/models/StudentRequest';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialModule],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.css'
})
export class StudentFormComponent implements OnInit {
  private studentService = inject(StudentService);
  private httpError = inject(HttpErrorService);
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  studentForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  loading: boolean = false;
  errorMessage: string | null = null;

  // Mode édition détecté par la présence du param :id dans l'URL.
  private studentId: number | null = null;
  get isEditMode(): boolean {
    return this.studentId !== null;
  }

  ngOnInit(): void {
    // Validators.pattern(/\S/) : au moins un caractère non-blanc, pour éviter
    // une saisie composée uniquement d'espaces (conforme à @NotBlank côté back).
    this.studentForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern(/\S/)]],
      lastName: ['', [Validators.required, Validators.pattern(/\S/)]]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam !== null) {
      this.studentId = Number(idParam);
      this.loadStudent(this.studentId);
    }
  }

  get form() {
    return this.studentForm.controls;
  }

  private loadStudent(id: number): void {
    this.loading = true;
    this.studentService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student: Student) => {
          this.loading = false;
          // On ne remplit que les deux champs éditables : jamais l'id.
          this.studentForm.patchValue({
            firstName: student.firstName,
            lastName: student.lastName
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = this.httpError.toUserMessage(error, { 404: 'Étudiant introuvable.' });
        }
      });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.studentForm.invalid) {
      return;
    }
    this.loading = true;
    this.errorMessage = null;

    // .trim() : on n'envoie jamais d'espaces superflus au back.
    const payload: StudentRequest = {
      firstName: (this.studentForm.get('firstName')?.value as string).trim(),
      lastName: (this.studentForm.get('lastName')?.value as string).trim()
    };

    const request$ = this.isEditMode
      ? this.studentService.update(this.studentId!, payload)
      : this.studentService.create(payload);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student: Student) => {
          this.loading = false;
          this.snackBar.open(
            this.isEditMode ? 'Étudiant mis à jour.' : 'Étudiant créé.',
            'Fermer',
            { duration: 3000 }
          );
          this.router.navigate(['/students', student.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = this.httpError.toUserMessage(error, { 404: 'Étudiant introuvable.' });
        }
      });
  }

  onReset(): void {
    this.submitted = false;
    this.errorMessage = null;
    this.studentForm.reset();
  }
}
