import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { Api } from './api.service';
import { User } from './models';

interface Session { accessToken: string; refreshToken: string; expiresAt: number; }
const KEY = 'melodify_session';

/** Spotify tokens live in the browser; the client secret stays on the API. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(Api);
  private router = inject(Router);
  private session: Session | null = read();
  private refreshing$: Observable<string | null> | null = null;
  readonly user = signal<User | null>(null);
  readonly signedIn = computed(() => !!this.user());
  // Spotify stopped sharing the plan ("product") in 2026: unknown counts as Premium, the player reports otherwise.
  readonly premium = computed(() => this.user()?.product !== 'free');

  get token() { return this.session?.accessToken ?? null; }
  get expiresSoon() { return !!this.session && this.session.expiresAt - Date.now() < 60_000; }

  restore(): Observable<void> {
    if (!this.session) return of(void 0);
    return this.api.me().pipe(tap(u => this.user.set(u)), map(() => void 0), catchError(() => { this.clear(); return of(void 0); }));
  }

  finishLogin(code: string) {
    return this.api.exchange(code).pipe(tap(r => {
      this.save({ accessToken: r.accessToken, refreshToken: r.refreshToken, expiresAt: Date.now() + r.expiresIn * 1000 });
      this.user.set(r.user);
    }));
  }

  /** One refresh at a time, shared by every request waiting for it. */
  refresh(): Observable<string | null> {
    const s = this.session;
    if (!s?.refreshToken) return of(null);
    if (!this.refreshing$) {
      this.refreshing$ = this.api.refresh(s.refreshToken).pipe(
        map(r => { this.save({ accessToken: r.accessToken, refreshToken: r.refreshToken, expiresAt: Date.now() + r.expiresIn * 1000 }); return r.accessToken; }),
        catchError(() => { this.logout(); return of(null); }),
        finalize(() => (this.refreshing$ = null)),
        shareReplay(1),
      );
    }
    return this.refreshing$;
  }

  logout() { this.clear(); this.router.navigateByUrl('/login'); }
  private save(s: Session) { this.session = s; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ } }
  private clear() { this.session = null; this.user.set(null); try { localStorage.removeItem(KEY); } catch { /* ignore */ } }
}
function read(): Session | null { try { return JSON.parse(localStorage.getItem(KEY) ?? 'null'); } catch { return null; } }
