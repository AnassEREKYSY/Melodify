import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Api } from '../core/api.service';
import { CompactPipe, YearPipe } from '../core/format';
import { errorText } from '../core/http';
import { ArtistPage as ArtistData } from '../core/models';
import { PlayerService } from '../core/player.service';
import { ToastService } from '../core/toast.service';
import { CoverComponent } from '../shared/cover.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { MediaCardComponent } from '../shared/media-card.component';
import { TrackListComponent } from '../shared/track-list.component';

type Kind = 'all' | 'album' | 'single' | 'compilation';

@Component({
  selector: 'app-artist',
  imports: [CompactPipe, YearPipe, CoverComponent, EmptyStateComponent, IconComponent, MediaCardComponent, TrackListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (error()) {
      <div class="page py-10"><app-empty icon="ban" title="Could not open this artist" [text]="error()" /></div>
    } @else if (!data()) {
      <div class="page flex items-end gap-6 pb-6 pt-10"><div class="skeleton h-44 w-44 !rounded-full"></div><div class="flex-1 space-y-3"><div class="skeleton h-12 w-1/2"></div><div class="skeleton h-4 w-1/4"></div></div></div>
    } @else {
      @let a = data()!.artist;
      <header class="bg-gradient-to-b from-raised to-transparent">
        <div class="page flex flex-col gap-5 pb-6 pt-10 sm:flex-row sm:items-end sm:gap-7">
          <app-cover class="w-40 shrink-0 shadow-2xl shadow-black/40 sm:w-48" [src]="a.image" [round]="true" icon="user" />
          <div class="min-w-0">
            <p class="eyebrow !text-ink-muted">Artist</p>
            <h1 class="mt-1 break-words text-[36px] font-bold leading-none tracking-[-0.03em] sm:text-[60px]">{{ a.name }}</h1>
            @if (a.followers != null) { <p class="mt-3 text-sm text-ink-muted">{{ a.followers | compact }} followers</p> }
            @if (a.genres.length) { <div class="mt-3 flex flex-wrap gap-1.5">@for (g of a.genres.slice(0, 4); track g) { <span class="tag capitalize">{{ g }}</span> }</div> }
          </div>
        </div>
      </header>
      <div class="page">
        <div class="flex items-center gap-3 py-4">
          <button type="button" class="play-btn mr-1 h-14 w-14" (click)="player.playContext(a.uri)" aria-label="Play artist"><app-icon name="play" [size]="22" [fill]="true" /></button>
          <button type="button" class="btn-secondary btn-sm" [class.!border-accent]="following()" [attr.aria-pressed]="following()" (click)="toggleFollow()" [disabled]="busy()" data-testid="follow">
            {{ following() ? 'Following' : 'Follow' }}
          </button>
        </div>

        <section aria-labelledby="pop-h">
          <h2 id="pop-h" class="h2">Songs</h2>
          @if (data()!.topTracks.length) {
            <app-track-list class="mt-2" [tracks]="showAll() ? data()!.topTracks : data()!.topTracks.slice(0, 5)" (play)="player.playUris(uris(), $event)" />
            @if (data()!.topTracks.length > 5) { <button type="button" class="btn-ghost btn-sm mt-1" (click)="showAll.set(!showAll())">{{ showAll() ? 'Show less' : 'See more' }}</button> }
          } @else { <p class="mt-2 text-sm text-ink-faint">No songs found for this artist.</p> }
        </section>

        <section class="mt-10" aria-labelledby="disc-h">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 id="disc-h" class="h2">Discography</h2>
            <div class="flex flex-wrap gap-2" role="group" aria-label="Release type">
              @for (k of kinds(); track k.id) { <button type="button" class="chip" [class.chip-on]="kind() === k.id" [attr.aria-pressed]="kind() === k.id" (click)="kind.set(k.id)">{{ k.label }}</button> }
            </div>
          </div>
          <div class="-mx-2.5 mt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
            @for (al of albums(); track al.id) {
              <app-media-card [link]="['/album', al.id]" [title]="al.name" [subtitle]="(al.releaseDate | year) + ' · ' + label(al.albumType)" [image]="al.image" (play)="player.playContext(al.uri)" />
            }
          </div>
        </section>
      </div>
    }
  `,
})
export class ArtistPage {
  id = input.required<string>();
  private api = inject(Api);
  private toast = inject(ToastService);
  private title = inject(Title);
  player = inject(PlayerService);
  data = signal<ArtistData | null>(null);
  error = signal('');
  following = signal(false);
  busy = signal(false);
  showAll = signal(false);
  kind = signal<Kind>('all');
  uris = computed(() => this.data()?.topTracks.map(t => t.uri) ?? []);
  albums = computed(() => { const k = this.kind(), list = this.data()?.albums ?? []; return k === 'all' ? list : list.filter(a => a.albumType === k); });
  kinds = computed(() => {
    const list = this.data()?.albums ?? [];
    const opts: { id: Kind; label: string }[] = [{ id: 'all', label: 'All' }];
    for (const [id, l] of [['album', 'Albums'], ['single', 'Singles and EPs'], ['compilation', 'Compilations']] as [Kind, string][]) if (list.some(a => a.albumType === id)) opts.push({ id, label: l });
    return opts;
  });

  constructor() { effect(() => { const id = this.id(); untracked(() => this.load(id)); }); }

  load(id: string) {
    this.data.set(null); this.error.set(''); this.kind.set('all'); this.showAll.set(false);
    this.api.artist(id).subscribe({
      next: d => { this.data.set(d); this.following.set(d.following); this.title.setTitle(`${d.artist.name} · Melodify`); },
      error: e => this.error.set(errorText(e)),
    });
  }
  label(t: string) { return t === 'single' ? 'Single' : t === 'compilation' ? 'Compilation' : 'Album'; }
  toggleFollow() {
    const on = !this.following();
    this.busy.set(true); this.following.set(on);
    (on ? this.api.follow(this.id()) : this.api.unfollow(this.id())).subscribe({
      next: () => { this.busy.set(false); this.toast.show(on ? `Following ${this.data()!.artist.name}` : 'Unfollowed'); },
      error: e => { this.busy.set(false); this.following.set(!on); this.toast.error(errorText(e)); },
    });
  }
}
