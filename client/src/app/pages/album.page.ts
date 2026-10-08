import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api.service';
import { YearPipe, hoursMinutes } from '../core/format';
import { errorText } from '../core/http';
import { Album } from '../core/models';
import { PlayerService } from '../core/player.service';
import { CoverComponent } from '../shared/cover.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { TrackListComponent } from '../shared/track-list.component';

@Component({
  selector: 'app-album',
  imports: [RouterLink, YearPipe, CoverComponent, EmptyStateComponent, IconComponent, TrackListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (error()) {
      <div class="page py-10"><app-empty icon="ban" title="Could not open this album" [text]="error()" /></div>
    } @else if (!album()) {
      <div class="page flex items-end gap-6 pb-6 pt-10"><div class="skeleton h-44 w-44"></div><div class="flex-1 space-y-3"><div class="skeleton h-10 w-2/3"></div><div class="skeleton h-4 w-1/3"></div></div></div>
    } @else {
      @let a = album()!;
      <header class="bg-gradient-to-b from-raised to-transparent">
        <div class="page flex flex-col gap-5 pb-6 pt-10 sm:flex-row sm:items-end sm:gap-6">
          <app-cover class="w-40 shrink-0 shadow-2xl shadow-black/40 sm:w-48" [src]="a.image" icon="disc" />
          <div class="min-w-0">
            <p class="eyebrow !text-ink-muted">{{ a.albumType === 'single' ? 'Single' : a.albumType === 'compilation' ? 'Compilation' : 'Album' }}</p>
            <h1 class="mt-1 break-words text-[32px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[48px]">{{ a.name }}</h1>
            <p class="mt-3 text-sm text-ink-muted">
              @for (ar of a.artists; track ar.id; let last = $last) { <a [routerLink]="['/artist', ar.id]" class="font-medium text-ink hover:underline">{{ ar.name }}</a>{{ last ? '' : ', ' }} }
              · {{ a.releaseDate | year }} · {{ a.totalTracks }} songs · {{ duration() }}
            </p>
          </div>
        </div>
      </header>
      <div class="page">
        <div class="py-4"><button type="button" class="play-btn h-14 w-14" (click)="player.playContext(a.uri)" aria-label="Play album"><app-icon name="play" [size]="22" [fill]="true" /></button></div>
        <app-track-list [tracks]="a.tracks ?? []" [showCover]="false" [showAlbum]="false" [showHeader]="true" (play)="player.playContext(a.uri, $event)" />
        @if (a.label) { <p class="mt-6 text-2xs text-ink-faint">{{ a.releaseDate }} · {{ a.label }}</p> }
      </div>
    }
  `,
})
export class AlbumPage {
  id = input.required<string>();
  private api = inject(Api);
  private title = inject(Title);
  player = inject(PlayerService);
  album = signal<Album | null>(null);
  error = signal('');
  duration = computed(() => hoursMinutes(Math.round((this.album()?.tracks ?? []).reduce((s, t) => s + t.durationMs, 0) / 60000)));

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => {
        this.album.set(null); this.error.set('');
        this.api.album(id).subscribe({
          next: a => {
            // Album tracks come without album info; add it back so rows can show the cover and link.
            const ref = { id: a.id, name: a.name, image: a.image, releaseDate: a.releaseDate };
            this.album.set({ ...a, tracks: (a.tracks ?? []).map(t => ({ ...t, album: t.album ?? ref })) });
            this.title.setTitle(`${a.name} · Melodify`);
          },
          error: e => this.error.set(errorText(e)),
        });
      });
    });
  }
}
