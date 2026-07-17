import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Login } from '../models/Login';
import { LoginResponse } from '../models/LoginResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private httpClient: HttpClient) { }

  login(credentials: Login): Observable<LoginResponse> {
    // responseType: 'text' car le back renvoie le JWT brut en text/plain
    // (ResponseEntity.ok(String)), et non un objet JSON. Sans cette option,
    // HttpClient tenterait un JSON.parse et échouerait.
    // L'URL reste relative (/api/...) : la base http://localhost:8080 est
    // gérée par le proxy (proxy.conf.json), comme pour UserService.register.
    return this.httpClient
      .post('/api/login', credentials, { responseType: 'text' })
      // On emballe la chaîne brute dans LoginResponse pour exposer un type
      // structuré aux consommateurs du service.
      .pipe(map(token => ({ token })));
  }
}
