import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { HttpErrorService } from '../../../core/service/http-error.service';
import { Student } from '../../../core/models/Student';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialModule],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.css'
})
export class StudentDetailComponent implements OnInit {
  private studentService = inject(StudentService);
  private httpError = inject(HttpErrorService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  student: Student | null = null;
  loading: boolean = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.studentService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student: Student) => {
          this.loading = false;
          this.student = student;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = this.httpError.toUserMessage(error, { 404: 'Étudiant introuvable.' });
        }
      });
  }

  onDelete(): void {
    if (!this.student) {
      return;
    }
    const confirmed = confirm(`Supprimer l'étudiant ${this.student.firstName} ${this.student.lastName} ?`);
    if (!confirmed) {
      return;
    }
    this.studentService.delete(this.student.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('Étudiant supprimé.', 'Fermer', { duration: 3000 });
          this.router.navigate(['/students']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.httpError.toUserMessage(error, { 404: 'Étudiant introuvable.' });
        }
      });
  }
}
