import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthGuard],
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if there is an accessToken', () => {
    localStorage.setItem('accessToken', 'test-token');
    const canActivate = guard.canActivate({} as any, {} as any);
    expect(canActivate).toBeTrue();
  });

  it('should redirect to login if there is no accessToken', () => {
    localStorage.removeItem('accessToken');
    const canActivate = guard.canActivate({} as any, {} as any);
    expect(canActivate).toBeFalse();
  });
});
