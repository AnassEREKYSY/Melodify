import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Api } from '../core/api.service';
import { errorText } from '../core/http';
import { LibraryService } from '../core/library.service';
import { Track } from '../core/models';
import { PlayerService } from '../core/player.service';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { TrackListComponent } from '../shared/track-list.component';

@Component({
  selector: 'app-liked',
  imports: [EmptyStateComponent, IconComponent, TrackListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-gradient-to-b from-accent/25 to-transparent">
      <div class="page flex items-end gap-6 pb-6 pt-10">
        <span class="hidden h-44 w-44 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink shadow-2xl shadow-black/40 sm:flex"><app-icon name="heart" [size]="64" [fill]="true" /></span>
        <div>
          <p class="eyebrow !text-ink-muted">Playlist</p>
          <h1 class="mt-1 text-[36px] font-bold leading-none tracking-[-0.03em] sm:text-[56px]">Liked songs</h1>
          <p class="mt-3 text-sm text-ink-muted">{{ total() }} songs</p>
        </div>
      </div>
    </header>
    <div class="page">
      <div class="flex items-center gap-3 py-4">
        <button type="button" class="play-btn h-14 w-14" (click)="play(0)" [disabled]="!tracks().length" aria-label="Play liked songs"><app-icon name="play" [size]="22" [fill]="true" /></button>
      </div>
      @if (error()) { <app-empty icon="ban" title="Could not load your liked songs" [text]="error()" /> }
      @else if (loading() && !tracks().length) { <div class="space-y-2">@for (i of [1,2,3,4,5,6]; track i) { <div class="skeleton h-12"></div> }</div> }
      @else if (tracks().length) {
        <app-track-list [tracks]="visible()" [showHeader]="true" (play)="play($event)" />
        @if (tracks().length < total()) {
          <div class="mt-4 flex justify-center"><button type="button" class="btn-secondary" (click)="more()" [disabled]="loading()">{{ loading() ? 'Loading…' : 'Load more' }}</button></div>
        }
      } @else { <app-empty icon="heart" title="No liked songs yet" text="Tap the heart on any song to save it here." /> }
    </div>
  `,
})
export class LikedPage {
  private api = inject(Api);
  private lib = inject(LibraryService);
  player = inject(PlayerService);
  tracks = signal<Track[]>([]);
  total = signal(0);
  loading = signal(true);
  error = signal('');
  /** Songs un-liked on this page disappear from the list. */
  visible = computed(() => { const liked = this.lib.liked(); return this.tracks().filter(t => liked.has(t.id) || !this.checked.has(t.id)); });
  private checked = new Set<string>();

  constructor() {
    this.more();
    effect(() => this.lib.liked().forEach(id => this.checked.add(id)));
  }

  more() {
    this.loading.set(true);
    this.api.liked(this.tracks().length).subscribe({
      next: p => { this.tracks.update(t => [...t, ...p.items]); this.total.set(p.total); this.loading.set(false); },
      error: e => { this.error.set(errorText(e)); this.loading.set(false); },
    });
  }

  play(i: number) { const v = this.visible(); this.player.playUris(v.slice(i, i + 100).map(t => t.uri)); }
}
