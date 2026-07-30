import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Register } from '../models/Register';

describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(UserService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // A15
  it("register émet un POST /api/register avec l'utilisateur", () => {
    const user: Register = { firstName: 'Ada', lastName: 'Lovelace', login: 'ada', password: 'pwd' };

    service.register(user).subscribe();

    const req = httpTesting.expectOne('/api/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);
    req.flush({});
  });

  // A16
  it('register émet la réponse du serveur', () => {
    const user: Register = { firstName: 'Ada', lastName: 'Lovelace', login: 'ada', password: 'pwd' };
    let response: unknown;

    service.register(user).subscribe(res => (response = res));

    const req = httpTesting.expectOne('/api/register');
    req.flush({});

    expect(response).toEqual({});
  });
});
