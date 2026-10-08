import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Api } from '../core/api.service';
import { CompactPipe, hoursMinutes, mmss } from '../core/format';
import { errorText } from '../core/http';
import { LibraryService } from '../core/library.service';
import { Artist, CountItem, RANGE_LABEL, Range, Stats, Track } from '../core/models';
import { PlayerService } from '../core/player.service';
import { ToastService } from '../core/toast.service';
import { CoverComponent } from '../shared/cover.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { TrackListComponent } from '../shared/track-list.component';

interface Data { stats: Stats; artists: Artist[]; tracks: Track[]; }

@Component({
  selector: 'app-stats',
  imports: [RouterLink, CompactPipe, CoverComponent, EmptyStateComponent, IconComponent, TrackListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page py-8">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div><h1 class="h1">Your stats</h1><p class="mt-1 text-ink-muted">What you really listen to, from your Spotify history.</p></div>
        <div class="flex rounded-full border border-line/[0.12] p-1" role="tablist" aria-label="Period">
          @for (r of ranges; track r) {
            <button type="button" role="tab" class="h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors" [class]="range() === r ? 'bg-ink text-bg' : 'text-ink-muted hover:text-ink'"
                    [attr.aria-selected]="range() === r" (click)="range.set(r)" [attr.data-testid]="'range-' + r">{{ label[r] }}</button>
          }
        </div>
      </div>

      @if (error()) {
        <app-empty class="mt-8" icon="ban" title="Could not load your stats" [text]="error()"><button type="button" class="btn-secondary btn-sm" (click)="load(range())">Try again</button></app-empty>
      } @else if (!data()) {
        <div class="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">@for (i of [1,2,3,4]; track i) { <div class="skeleton h-24"></div> }</div>
        <div class="mt-6 grid gap-6 lg:grid-cols-2"><div class="skeleton h-80"></div><div class="skeleton h-80"></div></div>
      } @else if (!data()!.artists.length && !data()!.tracks.length) {
        <app-empty class="mt-8" icon="chart" title="Not enough listening yet" text="Spotify needs a bit more history for this period. Try a longer one." />
      } @else {
        @let s = data()!.stats;
        <!-- Tiles -->
        <dl class="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="tiles">
          <div class="card p-4"><dt class="text-[13px] text-ink-faint">Top genre</dt><dd class="mt-1.5 truncate text-xl font-semibold capitalize">{{ s.topGenres.length ? s.topGenres[0].name : '–' }}</dd></div>
          <div class="card p-4"><dt class="text-[13px] text-ink-faint">Artists in your top</dt><dd class="mt-1.5 text-xl font-semibold tabular-nums">{{ s.artistCount }}</dd></div>
          <div class="card p-4"><dt class="text-[13px] text-ink-faint">Mainstream score</dt><dd class="mt-1.5 text-xl font-semibold tabular-nums">{{ s.averagePopularity != null ? Math.round(s.averagePopularity) : '–' }}<span class="text-sm font-normal text-ink-faint"> / 100</span></dd></div>
          <div class="card p-4"><dt class="text-[13px] text-ink-faint">Average song</dt><dd class="mt-1.5 text-xl font-semibold tabular-nums">{{ mmss(s.averageTrackSeconds * 1000) }}</dd></div>
        </dl>

        <!-- Top artists + tracks -->
        <div class="mt-6 grid gap-6 lg:grid-cols-2">
          <section class="card p-5" aria-labelledby="ta-h">
            <h2 id="ta-h" class="h2">Top artists</h2>
            <ol class="mt-3 space-y-1">
              @for (a of data()!.artists.slice(0, 10); track a.id; let i = $index) {
                <li><a [routerLink]="['/artist', a.id]" class="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-raised">
                  <span class="w-5 text-right text-sm tabular-nums text-ink-faint">{{ i + 1 }}</span>
                  <app-cover class="w-10 shrink-0" [src]="a.image" [round]="true" icon="user" [small]="true" />
                  <span class="min-w-0 flex-1"><span class="block truncate text-[15px]">{{ a.name }}</span><span class="block truncate text-[13px] capitalize text-ink-faint">{{ a.genres.slice(0, 2).join(', ') || 'Artist' }}</span></span>
                  <span class="text-[13px] tabular-nums text-ink-faint">{{ a.followers | compact }}</span>
                </a></li>
              }
            </ol>
          </section>
          <section class="card p-5" aria-labelledby="tt-h">
            <div class="flex items-center justify-between gap-3">
              <h2 id="tt-h" class="h2">Top tracks</h2>
              <button type="button" class="btn-secondary btn-sm" (click)="makePlaylist()" [disabled]="busy()" data-testid="make-playlist"><app-icon name="list-plus" [size]="15" /> {{ busy() ? 'Creating…' : 'Save as playlist' }}</button>
            </div>
            <app-track-list class="mt-2 -mx-3" [tracks]="data()!.tracks.slice(0, 10)" [showAlbum]="false" (play)="player.playUris(trackUris(), $event)" />
          </section>
        </div>

        <!-- Genres + decades -->
        <div class="mt-6 grid gap-6 lg:grid-cols-2">
          <section class="card p-5" aria-labelledby="g-h">
            <h2 id="g-h" class="h2">Genres</h2><p class="text-[13px] text-ink-faint">Number of your top artists in each genre</p>
            <ul class="mt-4 space-y-2.5">
              @for (g of s.topGenres.slice(0, 8); track g.name) { <li class="grid grid-cols-[minmax(0,9rem)_1fr_2rem] items-center gap-3 text-[13px]"><span class="truncate capitalize text-ink-muted">{{ g.name }}</span><span class="h-2.5 rounded-full bg-accent" [style.width.%]="pct(g.count, s.topGenres)"></span><span class="text-right tabular-nums text-ink-faint">{{ g.count }}</span></li> }
              @empty { <li class="text-sm text-ink-faint">Spotify has no genres for these artists.</li> }
            </ul>
          </section>
          <section class="card p-5" aria-labelledby="d-h">
            <h2 id="d-h" class="h2">Decades</h2><p class="text-[13px] text-ink-faint">When your top tracks came out</p>
            <ul class="mt-4 space-y-2.5">
              @for (d of s.decades; track d.name) { <li class="grid grid-cols-[minmax(0,9rem)_1fr_2rem] items-center gap-3 text-[13px]"><span class="truncate text-ink-muted">{{ d.name }}</span><span class="h-2.5 rounded-full bg-accent" [style.width.%]="pct(d.count, s.decades)"></span><span class="text-right tabular-nums text-ink-faint">{{ d.count }}</span></li> }
            </ul>
          </section>
        </div>

        <!-- Listening clock -->
        <section class="card mt-6 p-5" aria-labelledby="h-h" data-testid="hours">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="h-h" class="h2">When you listen</h2>
              <p class="text-[13px] text-ink-faint">Your last {{ s.recentPlays }} plays ({{ hm(s.recentMinutes) }}) by hour of day, your local time{{ peak() !== null ? '. Busiest around ' + hourLabel(peak()!) + '.' : '.' }}</p>
            </div>
            <button type="button" class="btn-ghost btn-sm" (click)="table.set(!table())" [attr.aria-pressed]="table()">{{ table() ? 'Show chart' : 'Show table' }}</button>
          </div>
          @if (table()) {
            <div class="mt-4 overflow-x-auto">
              <table class="w-full min-w-[480px] text-[13px]">
                <thead><tr class="text-left text-ink-faint"><th class="py-1.5 font-medium">Hour</th><th class="py-1.5 text-right font-medium">Plays</th><th class="py-1.5 font-medium pl-6">Hour</th><th class="py-1.5 text-right font-medium">Plays</th></tr></thead>
                <tbody>
                  @for (h of halfDay; track h) {
                    <tr class="border-t border-line/[0.06]"><td class="py-1.5 text-ink-muted">{{ hourLabel(h) }}</td><td class="py-1.5 text-right tabular-nums">{{ s.playsByHour[h] }}</td><td class="py-1.5 pl-6 text-ink-muted">{{ hourLabel(h + 12) }}</td><td class="py-1.5 text-right tabular-nums">{{ s.playsByHour[h + 12] }}</td></tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="mt-5" role="img" [attr.aria-label]="chartLabel()">
              <div class="flex h-40 items-end gap-[3px] sm:gap-1.5">
                @for (n of s.playsByHour; track $index; let h = $index) {
                  <div class="group relative flex h-full flex-1 items-end">
                    <div class="w-full rounded-t-[3px] transition-colors" [class]="n ? 'bg-accent group-hover:bg-accent-hover' : 'bg-line/[0.06]'" [style.height.%]="n ? Math.max(4, (n / hourMax()) * 100) : 2"></div>
                    <span class="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-raised px-2 py-1 text-2xs opacity-0 shadow-lg group-hover:opacity-100">{{ hourLabel(h) }} · {{ n }} {{ n === 1 ? 'play' : 'plays' }}</span>
                  </div>
                }
              </div>
              <div class="mt-2 flex text-2xs text-ink-faint" aria-hidden="true">
                @for (h of [0, 6, 12, 18]; track h) { <span class="flex-1">{{ hourLabel(h) }}</span> }
              </div>
            </div>
          }
        </section>
        <p class="mt-4 text-2xs text-ink-faint">Spotify shares your top artists and tracks for three periods and your last 50 plays. {{ s.explicitPercent }}% of your top tracks are explicit.</p>
      }
    </div>
  `,
})
export class StatsPage {
  private api = inject(Api);
  private toast = inject(ToastService);
  private router = inject(Router);
  private lib = inject(LibraryService);
  player = inject(PlayerService);
  Math = Math;
  mmss = mmss;
  hm = hoursMinutes;
  ranges: Range[] = ['short', 'medium', 'long'];
  label = RANGE_LABEL;
  halfDay = Array.from({ length: 12 }, (_, i) => i);

  range = signal<Range>(readRange());
  data = signal<Data | null>(null);
  error = signal('');
  busy = signal(false);
  table = signal(false);
  private cache = new Map<Range, Data>();

  trackUris = computed(() => this.data()?.tracks.slice(0, 10).map(t => t.uri) ?? []);
  hourMax = computed(() => Math.max(1, ...(this.data()?.stats.playsByHour ?? [])));
  peak = computed(() => { const h = this.data()?.stats.playsByHour ?? []; const m = Math.max(0, ...h); return m ? h.indexOf(m) : null; });
  chartLabel = computed(() => { const h = this.data()?.stats.playsByHour ?? []; return 'Plays by hour: ' + h.map((n, i) => `${this.hourLabel(i)} ${n}`).join(', '); });

  constructor() {
    effect(() => { const r = this.range(); untracked(() => this.load(r)); try { localStorage.setItem('melodify_range', r); } catch { /* ignore */ } });
  }

  load(r: Range) {
    this.error.set('');
    const hit = this.cache.get(r);
    if (hit) { this.data.set(hit); return; }
    this.data.set(null);
    forkJoin({ stats: this.api.stats(r), artists: this.api.topArtists(r, 50), tracks: this.api.topTracks(r, 50) }).subscribe({
      next: d => { this.cache.set(r, d); if (this.range() === r) this.data.set(d); },
      error: e => this.error.set(errorText(e)),
    });
  }

  pct(n: number, list: CountItem[]) { const max = Math.max(1, ...list.map(x => x.count)); return Math.max(4, (n / max) * 100); }
  hourLabel(h: number) { return new Date(2000, 0, 1, h).toLocaleTimeString([], { hour: 'numeric' }); }

  makePlaylist() {
    this.busy.set(true);
    this.api.fromTop(this.range(), 30).subscribe({
      next: p => { this.busy.set(false); this.lib.playlists.update(l => [p, ...l]); this.toast.show(`Created “${p.name}”`); this.router.navigate(['/playlist', p.id]); },
      error: e => { this.busy.set(false); this.toast.error(errorText(e)); },
    });
  }
}

function readRange(): Range { try { const r = localStorage.getItem('melodify_range'); return r === 'medium' || r === 'long' ? r : 'short'; } catch { return 'short'; } }
