import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../models/Student';
import { StudentRequest } from '../models/StudentRequest';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  // URL construite depuis environment.apiUrl (relatif en dev/prod : le proxy
  // route /api -> :8080 en dev ; same-origin en prod).
  private readonly baseUrl = `${environment.apiUrl}/api/students`;

  constructor(private httpClient: HttpClient) { }

  // GET /api/students -> liste complète (pas de pagination côté back).
  getAll(): Observable<Student[]> {
    return this.httpClient.get<Student[]>(this.baseUrl);
  }

  // GET /api/students/{id} -> un étudiant (404 si absent).
  getById(id: number): Observable<Student> {
    return this.httpClient.get<Student>(`${this.baseUrl}/${id}`);
  }

  // POST /api/students -> 201 + l'étudiant créé.
  create(payload: StudentRequest): Observable<Student> {
    return this.httpClient.post<Student>(this.baseUrl, payload);
  }

  // PUT /api/students/{id} -> remplacement complet (firstName + lastName).
  update(id: number, payload: StudentRequest): Observable<Student> {
    return this.httpClient.put<Student>(`${this.baseUrl}/${id}`, payload);
  }

  // DELETE /api/students/{id} -> 204 sans corps.
  // delete<void> (responseType json par défaut) n'essaie pas de parser le
  // corps vide : ne pas forcer responseType:'text'.
  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}
