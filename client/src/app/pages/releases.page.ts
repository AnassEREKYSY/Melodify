import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api.service';
import { NamesPipe } from '../core/format';
import { errorText } from '../core/http';
import { Album } from '../core/models';
import { PlayerService } from '../core/player.service';
import { CoverComponent } from '../shared/cover.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { MediaCardComponent } from '../shared/media-card.component';

type Kind = 'all' | 'album' | 'single';

@Component({
  selector: 'app-releases',
  imports: [RouterLink, NamesPipe, CoverComponent, EmptyStateComponent, IconComponent, MediaCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page py-8">
      <h1 class="h1">New releases for you</h1>
      <p class="mt-1 text-ink-muted">Fresh albums and singles from the artists you follow, newest first.</p>

      <div class="mt-6 flex flex-wrap items-center gap-2">
        <div class="flex rounded-full border border-line/[0.12] p-1" role="group" aria-label="Released in">
          @for (d of windows; track d.days) {
            <button type="button" class="h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors" [class]="days() === d.days ? 'bg-ink text-bg' : 'text-ink-muted hover:text-ink'" [attr.aria-pressed]="days() === d.days" (click)="days.set(d.days)">{{ d.label }}</button>
          }
        </div>
        <span class="mx-1 hidden h-6 w-px bg-line/[0.1] sm:block"></span>
        @for (k of kinds; track k.id) { <button type="button" class="chip" [class.chip-on]="kind() === k.id" [attr.aria-pressed]="kind() === k.id" (click)="kind.set(k.id)">{{ k.label }}</button> }
      </div>

      @if (error()) {
        <app-empty class="mt-8" icon="ban" title="Could not load new releases" [text]="error()" />
      } @else if (all() === null) {
        <div class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">@for (i of [1,2,3,4,5,6]; track i) { <div class="p-2.5"><div class="skeleton aspect-square"></div><div class="skeleton mt-3 h-3 w-3/4"></div></div> }</div>
      } @else if (shown().length) {
        @if (latest(); as l) {
          <a [routerLink]="['/album', l.id]" class="card group mt-6 flex items-center gap-5 overflow-hidden p-4 transition-colors hover:border-line/20 sm:p-5" data-testid="latest">
            <app-cover class="w-24 shrink-0 sm:w-32" [src]="l.image" icon="disc" />
            <div class="min-w-0 flex-1">
              <p class="eyebrow !text-accent">Latest · {{ ago(l.releaseDate) }}</p>
              <p class="mt-1 truncate text-xl font-semibold sm:text-2xl">{{ l.name }}</p>
              <p class="truncate text-sm text-ink-muted">{{ l.artists | names }} · {{ l.albumType === 'single' ? 'Single' : 'Album' }} · {{ l.totalTracks }} songs</p>
            </div>
            <button type="button" class="play-btn shrink-0" (click)="$event.preventDefault(); player.playContext(l.uri)" [attr.aria-label]="'Play ' + l.name"><app-icon name="play" [size]="18" [fill]="true" /></button>
          </a>
        }
        <div class="-mx-2.5 mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6" data-testid="releases">
          @for (r of shown().slice(1); track r.id) {
            <app-media-card [link]="['/album', r.id]" [title]="r.name" [subtitle]="(r.artists | names) + ' · ' + ago(r.releaseDate)" [image]="r.image" (play)="player.playContext(r.uri)" />
          }
        </div>
      } @else {
        <app-empty class="mt-8" icon="sparkle" title="Nothing new in this period" text="Try a longer period, or follow more artists from their pages.">
          <a routerLink="/stats" class="btn-secondary btn-sm">See your top artists</a>
        </app-empty>
      }
      <p class="mt-6 text-2xs text-ink-faint">Based on up to 60 of the artists you follow. Updated every 30 minutes.</p>
    </div>
  `,
})
export class ReleasesPage {
  private api = inject(Api);
  player = inject(PlayerService);
  windows = [{ days: 30, label: '30 days' }, { days: 90, label: '3 months' }, { days: 180, label: '6 months' }];
  kinds: { id: Kind; label: string }[] = [{ id: 'all', label: 'All' }, { id: 'album', label: 'Albums' }, { id: 'single', label: 'Singles and EPs' }];
  days = signal(30);
  kind = signal<Kind>('all');
  all = signal<Album[] | null>(null);
  error = signal('');
  shown = computed(() => { const k = this.kind(), l = this.all() ?? []; return k === 'all' ? l : l.filter(a => (k === 'single' ? a.albumType === 'single' : a.albumType !== 'single')); });
  latest = computed(() => this.shown()[0] ?? null);

  constructor() {
    effect(() => {
      const d = this.days();
      untracked(() => {
        this.all.set(null); this.error.set('');
        this.api.releases(d).subscribe({ next: r => this.all.set(r), error: e => this.error.set(errorText(e)) });
      });
    });
  }

  ago(date: string | null) {
    if (!date || date.length < 10) return date ?? '';
    const days = Math.floor((Date.now() - new Date(date + 'T00:00:00').getTime()) / 86_400_000);
    return days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : days < 7 ? `${days} days ago` : days < 14 ? 'Last week' : new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
  }
}
