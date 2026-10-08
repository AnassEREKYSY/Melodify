import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { errorText } from '../core/http';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-login',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <div class="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl" aria-hidden="true"></div>
      <div class="relative w-full max-w-sm text-center">
        <svg class="mx-auto" width="52" height="52" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#FF6B5A"/><path d="M8 19v-6M12.5 22V10M17 20v-8M21.5 23V9M26 18v-4" stroke="#1A0A07" stroke-width="2.4" stroke-linecap="round"/></svg>
        <h1 class="h1 mt-6">Your Spotify, sorted.</h1>
        <p class="mt-3 text-ink-muted">See what you really listen to, clean up your playlists, catch new releases from artists you follow and control playback from any device.</p>

        @if (busy()) {
          <p class="mt-10 inline-flex items-center gap-2 text-sm text-ink-muted"><span class="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent"></span> Signing you in…</p>
        } @else {
          <button type="button" class="btn-primary mt-10 h-12 w-full text-[15px]" (click)="start()" data-testid="login">Continue with Spotify</button>
          @if (message()) { <p class="mt-4 text-sm text-danger" role="alert">{{ message() }}</p> }
        }

        <ul class="mt-12 grid grid-cols-2 gap-3 text-left text-[13px] text-ink-muted">
          <li class="card flex items-center gap-2 px-3 py-2.5"><app-icon name="chart" [size]="16" class="text-accent" /> Listening stats</li>
          <li class="card flex items-center gap-2 px-3 py-2.5"><app-icon name="speaker" [size]="16" class="text-accent" /> Player and devices</li>
          <li class="card flex items-center gap-2 px-3 py-2.5"><app-icon name="wand" [size]="16" class="text-accent" /> Playlist tools</li>
          <li class="card flex items-center gap-2 px-3 py-2.5"><app-icon name="sparkle" [size]="16" class="text-accent" /> New releases</li>
        </ul>
        <p class="mt-8 text-2xs text-ink-faint">Melodify uses your Spotify account. Playing music needs Spotify Premium.</p>
      </div>
    </div>
  `,
})
export class LoginPage implements OnInit {
  code = input<string>();
  error = input<string>();
  next = input<string>();
  private api = inject(Api);
  private auth = inject(AuthService);
  private router = inject(Router);
  busy = signal(false);
  message = signal('');

  ngOnInit() {
    if (this.error()) { this.message.set(this.error() === 'access_denied' ? 'Spotify sign-in was cancelled.' : 'Spotify sign-in failed. Please try again.'); return; }
    const code = this.code();
    if (code) {
      this.busy.set(true);
      this.auth.finishLogin(code).subscribe({
        next: () => {
          let next = '/';
          try { next = sessionStorage.getItem('melodify_next') || '/'; sessionStorage.removeItem('melodify_next'); } catch { /* ignore */ }
          this.router.navigateByUrl(next.startsWith('/') && !next.startsWith('//') ? next : '/', { replaceUrl: true });
        },
        error: e => { this.busy.set(false); this.message.set(errorText(e, 'Spotify sign-in failed. Please try again.')); this.router.navigate([], { queryParams: {}, replaceUrl: true }); },
      });
    } else if (this.auth.signedIn()) {
      this.router.navigateByUrl('/', { replaceUrl: true });
    }
  }

  start() {
    this.busy.set(true);
    try { if (this.next()) sessionStorage.setItem('melodify_next', this.next()!); } catch { /* ignore */ }
    this.api.loginUrl().subscribe({
      next: r => (window.location.href = r.url),
      error: e => { this.busy.set(false); this.message.set(errorText(e)); },
    });
  }
}
