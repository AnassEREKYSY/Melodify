import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Api } from '../core/api.service';
import { hoursMinutes } from '../core/format';
import { errorText } from '../core/http';
import { LibraryService } from '../core/library.service';
import { PlaylistDetail, PlaylistStats, Track } from '../core/models';
import { PlayerService } from '../core/player.service';
import { ToastService } from '../core/toast.service';
import { CoverComponent } from '../shared/cover.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { TrackListComponent } from '../shared/track-list.component';

type Panel = 'stats' | 'sort' | 'edit' | 'delete' | null;

@Component({
  selector: 'app-playlist',
  imports: [FormsModule, CoverComponent, EmptyStateComponent, IconComponent, TrackListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (error()) {
      <div class="page py-10"><app-empty icon="ban" title="Could not open this playlist" [text]="error()" /></div>
    } @else if (!data()) {
      <div class="page flex items-end gap-6 pb-6 pt-10"><div class="skeleton h-44 w-44"></div><div class="flex-1 space-y-3"><div class="skeleton h-10 w-2/3"></div><div class="skeleton h-4 w-1/3"></div></div></div>
    } @else {
      @let p = data()!.playlist;
      <header class="bg-gradient-to-b from-raised to-transparent">
        <div class="page flex flex-col gap-5 pb-6 pt-10 sm:flex-row sm:items-end sm:gap-6">
          <app-cover class="w-40 shrink-0 shadow-2xl shadow-black/40 sm:w-48" [src]="p.image" />
          <div class="min-w-0">
            <p class="eyebrow !text-ink-muted">{{ p.isOwn ? 'Your playlist' : 'Playlist' }}</p>
            <h1 class="mt-1 break-words text-[32px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[48px]">{{ p.name }}</h1>
            @if (p.description) { <p class="mt-2 line-clamp-2 text-sm text-ink-muted" [innerHTML]="p.description"></p> }
            <p class="mt-3 text-sm text-ink-muted"><span class="font-medium text-ink">{{ p.isOwn ? 'You' : (p.owner.name ?? 'Spotify') }}</span> · {{ data()!.tracksHidden ? p.trackCount : tracks().length }} songs @if (!data()!.tracksHidden) { · {{ duration() }} }</p>
          </div>
        </div>
      </header>

      <div class="page">
        <div class="flex flex-wrap items-center gap-2 py-4">
          <button type="button" class="play-btn mr-2 h-14 w-14" (click)="player.playContext(p.uri)" [disabled]="!tracks().length" aria-label="Play"><app-icon name="play" [size]="22" [fill]="true" /></button>
          @if (!data()!.tracksHidden) { <button type="button" class="btn-secondary btn-sm" [class.!border-accent]="panel() === 'stats'" (click)="toggle('stats')" data-testid="pl-stats"><app-icon name="chart" [size]="15" /> Stats</button> }
          @if (p.isOwn) {
            <button type="button" class="btn-secondary btn-sm" (click)="dedupe()" [disabled]="busy()" data-testid="pl-dedupe"><app-icon name="wand" [size]="15" /> Remove duplicates</button>
            <button type="button" class="btn-secondary btn-sm" [class.!border-accent]="panel() === 'sort'" (click)="toggle('sort')" data-testid="pl-sort"><app-icon name="arrow-up-down" [size]="15" /> Sort</button>
            <button type="button" class="btn-ghost btn-sm" [class.!bg-raised]="panel() === 'edit'" (click)="toggle('edit')"><app-icon name="pencil" [size]="15" /> Edit</button>
          }
          <button type="button" class="btn-ghost btn-sm text-ink-faint" (click)="toggle('delete')"><app-icon name="trash" [size]="15" /> {{ p.isOwn ? 'Delete' : 'Remove from library' }}</button>
        </div>

        @switch (panel()) {
          @case ('stats') {
            <section class="card mb-6 p-5" aria-label="Playlist stats" data-testid="stats-panel">
              @if (stats(); as s) {
                <dl class="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div><dt class="text-[13px] text-ink-faint">Length</dt><dd class="mt-1 text-xl font-semibold tabular-nums">{{ hm(s.totalMinutes) }}</dd></div>
                  <div><dt class="text-[13px] text-ink-faint">Songs</dt><dd class="mt-1 text-xl font-semibold tabular-nums">{{ s.trackCount }}</dd></div>
                  <div><dt class="text-[13px] text-ink-faint">Explicit</dt><dd class="mt-1 text-xl font-semibold tabular-nums">{{ s.explicitPercent }}%</dd></div>
                  <div><dt class="text-[13px] text-ink-faint">Duplicates</dt><dd class="mt-1 text-xl font-semibold tabular-nums" [class.text-accent]="s.duplicates > 0">{{ s.duplicates }}</dd></div>
                </dl>
                <div class="mt-6 grid gap-6 md:grid-cols-2">
                  <div><h3 class="text-sm font-medium">Most featured artists</h3>
                    <ul class="mt-3 space-y-2">@for (a of s.topArtists.slice(0, 6); track a.name) { <li class="grid grid-cols-[minmax(0,8rem)_1fr_2rem] items-center gap-3 text-[13px]"><span class="truncate text-ink-muted">{{ a.name }}</span><span class="h-2 rounded-full bg-accent" [style.width.%]="pct(a.count, s.topArtists)"></span><span class="text-right tabular-nums text-ink-faint">{{ a.count }}</span></li> }</ul>
                  </div>
                  <div><h3 class="text-sm font-medium">Release decades</h3>
                    <ul class="mt-3 space-y-2">@for (d of s.decades; track d.name) { <li class="grid grid-cols-[minmax(0,8rem)_1fr_2rem] items-center gap-3 text-[13px]"><span class="truncate text-ink-muted">{{ d.name }}</span><span class="h-2 rounded-full bg-accent" [style.width.%]="pct(d.count, s.decades)"></span><span class="text-right tabular-nums text-ink-faint">{{ d.count }}</span></li> }</ul>
                  </div>
                </div>
              } @else { <div class="skeleton h-28"></div> }
            </section>
          }
          @case ('sort') {
            <form class="card mb-6 flex flex-wrap items-end gap-3 p-5" (ngSubmit)="sort()">
              <div><label class="label" for="sort-by">Sort by</label>
                <select id="sort-by" class="select w-48" name="by" [(ngModel)]="sortBy">@for (o of sortOptions; track o.id) { <option [value]="o.id">{{ o.label }}</option> }</select></div>
              <div><label class="label" for="sort-dir">Order</label>
                <select id="sort-dir" class="select w-44" name="dir" [(ngModel)]="sortDesc"><option [ngValue]="false">Ascending</option><option [ngValue]="true">Descending</option></select></div>
              <p class="basis-full text-[13px] text-ink-faint sm:order-last">This rewrites the playlist order on Spotify.</p>
              <button type="submit" class="btn-primary" [disabled]="busy()">{{ busy() ? 'Sorting…' : 'Sort playlist' }}</button>
            </form>
          }
          @case ('edit') {
            <form class="card mb-6 grid gap-4 p-5 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end" (ngSubmit)="save()">
              <div><label class="label" for="ed-name">Name</label><input id="ed-name" class="input" name="name" [(ngModel)]="editName" required maxlength="100" /></div>
              <div><label class="label" for="ed-desc">Description</label><input id="ed-desc" class="input" name="desc" [(ngModel)]="editDesc" maxlength="300" /></div>
              <button type="submit" class="btn-primary" [disabled]="busy() || !editName.trim()">Save</button>
            </form>
          }
          @case ('delete') {
            <div class="card mb-6 flex flex-wrap items-center justify-between gap-3 border-danger/40 p-5" role="alertdialog" aria-label="Confirm">
              <p class="text-sm">{{ p.isOwn ? 'Delete this playlist? It is removed from your library and profile.' : 'Remove this playlist from your library?' }}</p>
              <div class="flex gap-2"><button type="button" class="btn-ghost btn-sm" (click)="panel.set(null)">Cancel</button><button type="button" class="btn btn-sm bg-danger text-white hover:bg-danger/90" (click)="remove()" [disabled]="busy()">{{ p.isOwn ? 'Delete' : 'Remove' }}</button></div>
            </div>
          }
        }

        @if (data()!.skippedLocal) { <p class="mb-3 text-[13px] text-ink-faint">{{ data()!.skippedLocal }} local files are hidden. Tools that rewrite the playlist are turned off for it.</p> }
        @if (data()!.tracksHidden) {
          <app-empty icon="ban" title="Spotify does not share the songs of this playlist" text="Apps can only list the songs of playlists you own or collaborate on. You can still play it.">
            <button type="button" class="btn-primary btn-sm" (click)="player.playContext(p.uri)">Play playlist</button>
          </app-empty>
        } @else if (tracks().length) {
          <app-track-list [tracks]="tracks()" [showHeader]="true" [canRemove]="p.isOwn" (play)="player.playContext(p.uri, $event)" (remove)="removeTrack($event)" />
        } @else { <app-empty icon="music" title="This playlist is empty" text="Search for songs and add them from the menu next to each one." /> }
      </div>
    }
  `,
})
export class PlaylistPage {
  id = input.required<string>();
  private api = inject(Api);
  private toast = inject(ToastService);
  private router = inject(Router);
  private title = inject(Title);
  private lib = inject(LibraryService);
  player = inject(PlayerService);

  data = signal<PlaylistDetail | null>(null);
  stats = signal<PlaylistStats | null>(null);
  error = signal('');
  panel = signal<Panel>(null);
  busy = signal(false);
  tracks = computed(() => this.data()?.tracks ?? []);
  duration = computed(() => hoursMinutes(Math.round(this.tracks().reduce((s, t) => s + t.durationMs, 0) / 60000)));
  sortOptions = [{ id: 'artist', label: 'Artist' }, { id: 'title', label: 'Title' }, { id: 'release', label: 'Release date' }, { id: 'popularity', label: 'Popularity' }, { id: 'duration', label: 'Length' }, { id: 'added', label: 'Date added' }];
  sortBy = 'artist'; sortDesc = false; editName = ''; editDesc = '';
  hm = hoursMinutes;
  round = Math.round;

  constructor() {
    effect(() => { const id = this.id(); untracked(() => this.load(id)); });
  }

  load(id: string) {
    this.data.set(null); this.stats.set(null); this.error.set(''); this.panel.set(null);
    this.api.playlist(id).subscribe({
      next: d => { this.data.set(d); this.title.setTitle(`${d.playlist.name} · Melodify`); },
      error: e => this.error.set(errorText(e)),
    });
  }

  toggle(p: Panel) {
    this.panel.set(this.panel() === p ? null : p);
    if (p === 'stats' && !this.stats()) this.loadStats();
    if (p === 'edit') { const pl = this.data()!.playlist; this.editName = pl.name; this.editDesc = pl.description ?? ''; }
  }
  private loadStats() { this.api.playlistStats(this.id()).subscribe({ next: s => this.stats.set(s), error: e => this.toast.error(errorText(e)) }); }
  pct(n: number, list: { count: number }[]) { const max = Math.max(1, ...list.map(x => x.count)); return Math.max(4, (n / max) * 100); }

  dedupe() {
    this.busy.set(true);
    this.api.dedupe(this.id()).subscribe({
      next: r => { this.busy.set(false); this.toast.show(r.removed ? `Removed ${r.removed} duplicate${r.removed > 1 ? 's' : ''}` : 'No duplicates found'); if (r.removed) this.reload(r.trackCount); },
      error: e => { this.busy.set(false); this.toast.error(errorText(e)); },
    });
  }
  sort() {
    this.busy.set(true);
    this.api.sort(this.id(), this.sortBy, this.sortDesc).subscribe({
      next: r => { this.busy.set(false); this.panel.set(null); this.toast.show('Playlist sorted'); this.reload(r.trackCount); },
      error: e => { this.busy.set(false); this.toast.error(errorText(e)); },
    });
  }
  save() {
    const name = this.editName.trim(), desc = this.editDesc.trim() || null;
    this.busy.set(true);
    this.api.updatePlaylist(this.id(), name, desc).subscribe({
      next: () => {
        this.busy.set(false); this.panel.set(null);
        this.data.update(d => d && { ...d, playlist: { ...d.playlist, name, description: desc } });
        this.lib.playlists.update(l => l.map(p => (p.id === this.id() ? { ...p, name, description: desc } : p)));
        this.toast.show('Saved');
      },
      error: e => { this.busy.set(false); this.toast.error(errorText(e)); },
    });
  }
  remove() {
    this.busy.set(true);
    this.api.deletePlaylist(this.id()).subscribe({
      next: () => { this.lib.playlists.update(l => l.filter(p => p.id !== this.id())); this.toast.show('Removed from your library'); this.router.navigateByUrl('/library'); },
      error: e => { this.busy.set(false); this.toast.error(errorText(e)); },
    });
  }
  removeTrack(t: Track) {
    this.api.removeTracks(this.id(), [t.uri]).subscribe({
      next: () => {
        this.data.update(d => d && { ...d, tracks: d.tracks.filter(x => x.uri !== t.uri) });
        this.lib.playlists.update(l => l.map(p => (p.id === this.id() ? { ...p, trackCount: this.tracks().length } : p)));
        this.stats.set(null);
        this.toast.show(`Removed “${t.name}”`);
      },
      error: e => this.toast.error(errorText(e)),
    });
  }
  private reload(count: number) {
    this.stats.set(null);
    this.lib.playlists.update(l => l.map(p => (p.id === this.id() ? { ...p, trackCount: count } : p)));
    const panel = this.panel();
    this.api.playlist(this.id()).subscribe({ next: d => { this.data.set(d); if (panel === 'stats') this.loadStats(); }, error: () => {} });
  }
}
