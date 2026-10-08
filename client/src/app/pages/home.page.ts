import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { NamesPipe } from '../core/format';
import { LibraryService } from '../core/library.service';
import { Album, Artist, Track } from '../core/models';
import { PlayerService } from '../core/player.service';
import { CoverComponent } from '../shared/cover.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { MediaCardComponent } from '../shared/media-card.component';
import { TrackListComponent } from '../shared/track-list.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NamesPipe, CoverComponent, EmptyStateComponent, IconComponent, MediaCardComponent, TrackListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page py-8">
      <h1 class="h1">{{ greeting }}{{ firstName() ? ', ' + firstName() : '' }}</h1>

      <!-- Quick picks: liked songs + first playlists -->
      <div class="mt-6 grid grid-cols-2 gap-2 sm:gap-2.5 xl:grid-cols-3">
        <a routerLink="/liked" class="group flex items-center gap-3 overflow-hidden rounded-lg bg-surface pr-3 transition-colors hover:bg-raised">
          <span class="flex h-12 w-12 shrink-0 sm:h-14 sm:w-14 items-center justify-center bg-accent text-accent-ink"><app-icon name="heart" [size]="20" [fill]="true" /></span>
          <span class="truncate text-[13px] font-medium sm:text-sm">Liked songs</span>
        </a>
        @for (p of quick(); track p.id) {
          <a [routerLink]="['/playlist', p.id]" class="group flex items-center gap-3 overflow-hidden rounded-lg bg-surface pr-3 transition-colors hover:bg-raised">
            <app-cover class="w-12 shrink-0 sm:w-14 [&_.cover]:!rounded-none" [src]="p.image" />
            <span class="min-w-0 flex-1 truncate text-[13px] font-medium sm:text-sm">{{ p.name }}</span>
            <button type="button" class="play-btn hidden h-9 w-9 shrink-0 opacity-0 sm:inline-flex transition group-hover:opacity-100 focus-visible:opacity-100" (click)="$event.preventDefault(); player.playContext(p.uri)" [attr.aria-label]="'Play ' + p.name">
              <app-icon name="play" [size]="14" [fill]="true" />
            </button>
          </a>
        }
      </div>

      <!-- Recently played -->
      <section class="mt-10" aria-labelledby="recent-h">
        <div class="flex items-end justify-between"><h2 id="recent-h" class="h2">Recently played</h2></div>
        @if (recent() === null) { <div class="mt-4 space-y-2">@for (i of [1,2,3,4]; track i) { <div class="skeleton h-12"></div> }</div> }
        @else if (recent()!.length) { <app-track-list class="mt-3" [tracks]="recent()!.slice(0, 6)" (play)="playRecent($event)" /> }
        @else { <app-empty class="mt-4" icon="clock" title="Nothing played yet" text="Play something on Spotify and it will show up here." /> }
      </section>

      <!-- Top artists -->
      <section class="mt-10" aria-labelledby="artists-h">
        <div class="flex items-end justify-between">
          <div><h2 id="artists-h" class="h2">Your top artists lately</h2><p class="text-[13px] text-ink-faint">Last 4 weeks</p></div>
          <a routerLink="/stats" class="text-[13px] font-medium text-ink-muted hover:text-ink">See your stats</a>
        </div>
        <div class="scroller -mx-2.5 mt-2">
          @for (a of artists(); track a.id) {
            <app-media-card class="w-40 shrink-0 snap-start sm:w-44" [link]="['/artist', a.id]" [title]="a.name" subtitle="Artist" [image]="a.image" [round]="true" (play)="player.playContext(a.uri)" />
          } @empty { @for (i of [1,2,3,4,5]; track i) { <div class="w-40 shrink-0 p-2.5"><div class="skeleton aspect-square !rounded-full"></div></div> } }
        </div>
      </section>

      <!-- New releases preview -->
      <section class="mt-8" aria-labelledby="new-h">
        <div class="flex items-end justify-between">
          <div><h2 id="new-h" class="h2">New from artists you follow</h2><p class="text-[13px] text-ink-faint">Out in the last 30 days</p></div>
          <a routerLink="/releases" class="text-[13px] font-medium text-ink-muted hover:text-ink">See all</a>
        </div>
        @if (releases() === null) {
          <div class="scroller -mx-2.5 mt-2">@for (i of [1,2,3,4,5]; track i) { <div class="w-40 shrink-0 p-2.5"><div class="skeleton aspect-square"></div></div> }</div>
        } @else if (releases()!.length) {
          <div class="scroller -mx-2.5 mt-2">
            @for (r of releases()!.slice(0, 12); track r.id) {
              <app-media-card class="w-40 shrink-0 snap-start sm:w-44" [link]="['/album', r.id]" [title]="r.name" [subtitle]="(r.artists | names)" [image]="r.image" (play)="player.playContext(r.uri)" />
            }
          </div>
        } @else {
          <app-empty class="mt-4" icon="sparkle" title="No new releases this month" text="Follow more artists to get their new music here."><a routerLink="/search" class="btn-secondary btn-sm">Find artists</a></app-empty>
        }
      </section>
    </div>
  `,
})
export class HomePage {
  private api = inject(Api);
  private auth = inject(AuthService);
  lib = inject(LibraryService);
  player = inject(PlayerService);
  recent = signal<Track[] | null>(null);
  artists = signal<Artist[]>([]);
  releases = signal<Album[] | null>(null);
  quick = computed(() => this.lib.playlists().slice(0, 5));
  firstName = computed(() => this.auth.user()?.displayName?.split(' ')[0] ?? '');
  greeting = (() => { const h = new Date().getHours(); return h < 5 ? 'Good evening' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; })();

  constructor() {
    this.api.recent().subscribe({ next: r => this.recent.set(dedupe(r)), error: () => this.recent.set([]) });
    this.api.topArtists('short', 12).subscribe({ next: a => this.artists.set(a), error: () => {} });
    this.api.releases(30).subscribe({ next: r => this.releases.set(r), error: () => this.releases.set([]) });
  }

  playRecent(i: number) { const list = this.recent()!.slice(0, 6); this.player.playUris(list.map(t => t.uri), i); }
}

/** Recently played repeats tracks; keep the latest play of each. */
function dedupe(tracks: Track[]) { const seen = new Set<string>(); return tracks.filter(t => (seen.has(t.id) ? false : (seen.add(t.id), true))); }
