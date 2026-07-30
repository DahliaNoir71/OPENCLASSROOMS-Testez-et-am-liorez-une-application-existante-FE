import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let httpTesting: HttpTestingController;
  let router: Router;

  const setInputValue = (selector: string, value: string): void => {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    fixture = TestBed.createComponent(RegisterComponent);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  // B5
  it('ne soumet rien si le formulaire est invalide', () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    httpTesting.expectNone('/api/register');
  });

  // B6
  it("soumet l'inscription et navigue vers /login?registered=1", () => {
    setInputValue('input[formControlName="firstName"]', 'Ada');
    setInputValue('input[formControlName="lastName"]', 'Lovelace');
    setInputValue('input[formControlName="login"]', 'ada');
    setInputValue('input[formControlName="password"]', 'pwd');
    fixture.detectChanges();

    jest.spyOn(router, 'navigate');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    const req = httpTesting.expectOne('/api/register');
    expect(req.request.body).toEqual({ firstName: 'Ada', lastName: 'Lovelace', login: 'ada', password: 'pwd' });
    req.flush({});

    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { registered: '1' } });
  });
});
