import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

const withToken = (req: HttpRequest<unknown>, token: string | null) => (token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);

/** Adds the Spotify token, refreshes it shortly before expiry and once after a 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  if (!req.url.startsWith(environment.apiUrl) || req.url.includes('/spotify-auth/')) return next(req);
  const ready$ = auth.expiresSoon ? auth.refresh() : of(auth.token);
  return ready$.pipe(
    switchMap(token => next(withToken(req, token))),
    catchError((e: unknown) => {
      if (!(e instanceof HttpErrorResponse) || e.status !== 401 || !auth.token) return throwError(() => e);
      return auth.refresh().pipe(switchMap(t => (t ? next(withToken(req, t)) : throwError(() => e))));
    }),
  );
};

export const errorText = (e: unknown, fallback = 'Something went wrong. Please try again.') =>
  (e instanceof HttpErrorResponse && (e.error?.error as string)) || (e instanceof HttpErrorResponse && e.status === 0 ? 'Cannot reach the server.' : fallback);

export const authGuard: CanActivateFn = (_r, state) =>
  inject(AuthService).signedIn() || inject(Router).createUrlTree(['/login'], { queryParams: state.url !== '/' ? { next: state.url } : {} });
