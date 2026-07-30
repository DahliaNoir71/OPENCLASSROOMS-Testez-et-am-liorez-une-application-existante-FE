import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { HttpErrorService } from '../../../core/service/http-error.service';
import { Student } from '../../../core/models/Student';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialModule],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private httpError = inject(HttpErrorService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  students: Student[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.errorMessage = null;
    this.studentService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (students: Student[]) => {
          this.loading = false;
          this.students = students;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = this.httpError.toUserMessage(error);
        }
      });
  }

  onDelete(student: Student): void {
    const confirmed = confirm(`Supprimer l'étudiant ${student.firstName} ${student.lastName} ?`);
    if (!confirmed) {
      return;
    }
    this.studentService.delete(student.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('Étudiant supprimé.', 'Fermer', { duration: 3000 });
          this.loadStudents();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.httpError.toUserMessage(error);
        }
      });
  }
}
