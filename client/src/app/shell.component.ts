import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { LibraryService } from './core/library.service';
import { CoverComponent } from './shared/cover.component';
import { IconComponent } from './shared/icon.component';
import { PlayerBarComponent } from './shared/player-bar.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, CoverComponent, PlayerBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-raised focus:px-3 focus:py-2">Skip to content</a>
    <div class="flex h-dvh flex-col">
      <div class="flex min-h-0 flex-1">
        <!-- Sidebar -->
        <aside class="hidden w-64 shrink-0 flex-col border-r border-line/[0.06] px-3 py-5 md:flex">
          <a routerLink="/" class="flex items-center gap-2.5 px-3" aria-label="Melodify home">
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#FF6B5A"/><path d="M8 19v-6M12.5 22V10M17 20v-8M21.5 23V9M26 18v-4" stroke="#1A0A07" stroke-width="2.4" stroke-linecap="round"/></svg>
            <span class="text-[17px] font-semibold tracking-[-0.01em]">Melodify</span>
          </a>
          <nav class="mt-7 flex flex-col gap-0.5" aria-label="Main">
            @for (l of links; track l.path) {
              <a [routerLink]="l.path" routerLinkActive="!bg-raised !text-ink" [routerLinkActiveOptions]="{ exact: l.path === '/' }"
                 class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink">
                <app-icon [name]="l.icon" [size]="18" /> {{ l.label }}
              </a>
            }
          </nav>
          <div class="mt-6 flex items-center justify-between px-3">
            <p class="eyebrow">Your playlists</p>
            <a routerLink="/library" class="text-2xs text-ink-faint hover:text-ink">See all</a>
          </div>
          <ul class="mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
            <li><a routerLink="/liked" routerLinkActive="!bg-raised" class="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-raised">
              <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/90 text-accent-ink"><app-icon name="heart" [size]="16" [fill]="true" /></span>
              <span class="truncate text-sm">Liked songs</span></a></li>
            @for (p of lib.playlists(); track p.id) {
              <li><a [routerLink]="['/playlist', p.id]" routerLinkActive="!bg-raised" class="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-raised">
                <app-cover class="w-9 shrink-0" [src]="p.image" [small]="true" />
                <span class="min-w-0"><span class="block truncate text-sm">{{ p.name }}</span><span class="block truncate text-2xs text-ink-faint">{{ p.trackCount }} tracks</span></span>
              </a></li>
            }
          </ul>
          <div class="mt-3 flex items-center gap-2.5 border-t border-line/[0.06] px-2 pt-3">
            <app-cover class="w-8 shrink-0" [src]="auth.user()?.image" [round]="true" icon="user" [small]="true" />
            <div class="min-w-0 flex-1"><p class="truncate text-sm">{{ auth.user()?.displayName }}</p><p class="truncate text-2xs capitalize text-ink-faint">{{ auth.user()?.product }}</p></div>
            <button type="button" class="btn-icon h-8 w-8 text-ink-faint hover:text-ink" (click)="auth.logout()" aria-label="Sign out" title="Sign out"><app-icon name="logout" [size]="16" /></button>
          </div>
        </aside>

        <main id="main" class="min-w-0 flex-1 overflow-y-auto pb-24 md:pb-10"><router-outlet /></main>
      </div>

      <div class="relative">
        <app-player-bar class="fixed inset-x-0 bottom-[60px] z-40 md:static" />
        <!-- Mobile tabs -->
        <nav class="fixed inset-x-0 bottom-0 z-40 grid h-[60px] grid-cols-5 border-t border-line/[0.08] bg-bg pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Main">
          @for (l of links; track l.path) {
            <a [routerLink]="l.path" routerLinkActive="!text-ink" [routerLinkActiveOptions]="{ exact: l.path === '/' }" class="flex flex-col items-center justify-center gap-0.5 text-2xs text-ink-faint">
              <app-icon [name]="l.icon" [size]="20" />{{ l.short }}
            </a>
          }
        </nav>
      </div>
    </div>
  `,
})
export class ShellComponent {
  auth = inject(AuthService);
  lib = inject(LibraryService);
  links = [
    { path: '/', label: 'Home', short: 'Home', icon: 'home' },
    { path: '/search', label: 'Search', short: 'Search', icon: 'search' },
    { path: '/library', label: 'Library and tools', short: 'Library', icon: 'library' },
    { path: '/stats', label: 'Your stats', short: 'Stats', icon: 'chart' },
    { path: '/releases', label: 'New releases', short: 'New', icon: 'sparkle' },
  ];
  constructor() { this.lib.load(); }
}
