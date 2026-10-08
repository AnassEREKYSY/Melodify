import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../core/api.service';
import { errorText } from '../core/http';
import { LibraryService } from '../core/library.service';
import { Artist, Playlist, RANGE_LABEL, Range } from '../core/models';
import { PlayerService } from '../core/player.service';
import { ToastService } from '../core/toast.service';
import { CoverComponent } from '../shared/cover.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { MediaCardComponent } from '../shared/media-card.component';

type Filter = 'all' | 'mine' | 'followed' | 'artists';
type Tool = 'new' | 'top' | 'merge' | null;

@Component({
  selector: 'app-library',
  imports: [FormsModule, CoverComponent, EmptyStateComponent, IconComponent, MediaCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page py-8">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div><h1 class="h1">Your library</h1><p class="mt-1 text-ink-muted">{{ lib.playlists().length }} playlists · {{ mineCount() }} made by you</p></div>
        <button type="button" class="btn-primary" (click)="openTool('new')" data-testid="new-playlist"><app-icon name="plus" [size]="16" /> New playlist</button>
      </div>

      <!-- Tools -->
      <section class="mt-8 grid gap-3 md:grid-cols-3" aria-label="Playlist tools">
        <button type="button" class="card flex items-start gap-3 p-4 text-left transition-colors hover:border-line/20" [class.!border-accent]="tool() === 'top'" (click)="openTool('top')" data-testid="tool-top">
          <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent"><app-icon name="star" [size]="18" /></span>
          <span><span class="block font-medium">From your top tracks</span><span class="mt-0.5 block text-[13px] text-ink-muted">Save your most played songs as a playlist.</span></span>
        </button>
        <button type="button" class="card flex items-start gap-3 p-4 text-left transition-colors hover:border-line/20" [class.!border-accent]="tool() === 'merge'" (click)="openTool('merge')" data-testid="tool-merge">
          <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent"><app-icon name="merge" [size]="18" /></span>
          <span><span class="block font-medium">Merge playlists</span><span class="mt-0.5 block text-[13px] text-ink-muted">Combine two or more into a new one, without duplicates.</span></span>
        </button>
        <div class="card flex items-start gap-3 p-4">
          <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-raised text-ink-muted"><app-icon name="wand" [size]="18" /></span>
          <span><span class="block font-medium">Clean up and sort</span><span class="mt-0.5 block text-[13px] text-ink-muted">Open one of your playlists to remove duplicates or sort it.</span></span>
        </div>
      </section>

      @if (tool()) {
        <form class="card mt-3 p-5" (ngSubmit)="submit()" data-testid="tool-form">
          @switch (tool()) {
            @case ('new') {
              <h2 class="h2">New playlist</h2>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div><label class="label" for="np-name">Name</label><input id="np-name" class="input" name="name" [(ngModel)]="name" required maxlength="100" placeholder="My playlist" /></div>
                <div><label class="label" for="np-desc">Description <span class="text-ink-faint">(optional)</span></label><input id="np-desc" class="input" name="desc" [(ngModel)]="desc" maxlength="300" /></div>
              </div>
            }
            @case ('top') {
              <h2 class="h2">Playlist from your top tracks</h2>
              <div class="mt-4 grid gap-4 sm:grid-cols-3">
                <div><label class="label" for="t-range">Period</label>
                  <select id="t-range" class="select" name="range" [(ngModel)]="range">@for (r of ranges; track r) { <option [value]="r">{{ rangeLabel[r] }}</option> }</select></div>
                <div><label class="label" for="t-count">Songs</label>
                  <select id="t-count" class="select" name="count" [(ngModel)]="count">@for (c of [20, 30, 50]; track c) { <option [ngValue]="c">{{ c }}</option> }</select></div>
                <div><label class="label" for="t-name">Name <span class="text-ink-faint">(optional)</span></label><input id="t-name" class="input" name="name" [(ngModel)]="name" maxlength="100" [placeholder]="'Top ' + count + ' · ' + rangeLabel[range]" /></div>
              </div>
            }
            @case ('merge') {
              <h2 class="h2">Merge playlists</h2>
              <p class="mt-1 text-[13px] text-ink-muted">Pick at least two of your playlists. The originals stay as they are.</p>
              <div class="mt-4 grid max-h-64 gap-1 overflow-y-auto rounded-lg border border-line/[0.08] p-1.5 sm:grid-cols-2">
                @for (p of mine(); track p.id) {
                  <label class="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-raised">
                    <input type="checkbox" class="h-4 w-4 accent-[#FF6B5A]" [checked]="picked().has(p.id)" (change)="togglePick(p.id)" />
                    <app-cover class="w-8 shrink-0" [src]="p.image" [small]="true" />
                    <span class="min-w-0 flex-1 truncate text-sm">{{ p.name }}</span><span class="text-2xs text-ink-faint">{{ p.trackCount }}</span>
                  </label>
                }
              </div>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div><label class="label" for="m-name">Name <span class="text-ink-faint">(optional)</span></label><input id="m-name" class="input" name="name" [(ngModel)]="name" maxlength="100" placeholder="Merged playlist" /></div>
                <label class="flex items-center gap-2 self-end pb-2.5 text-sm text-ink-muted"><input type="checkbox" class="h-4 w-4 accent-[#FF6B5A]" name="dedupe" [(ngModel)]="removeDupes" /> Remove duplicate songs</label>
              </div>
            }
          }
          <div class="mt-5 flex justify-end gap-2">
            <button type="button" class="btn-ghost" (click)="tool.set(null)">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="busy() || (tool() === 'new' && !name.trim()) || (tool() === 'merge' && picked().size < 2)">
              {{ busy() ? 'Working…' : tool() === 'new' ? 'Create' : tool() === 'top' ? 'Create playlist' : 'Merge ' + picked().size + ' playlists' }}
            </button>
          </div>
        </form>
      }

      <!-- Filters -->
      <div class="mt-10 flex flex-wrap gap-2" role="group" aria-label="Show">
        @for (f of filters; track f.id) {
          <button type="button" class="chip" [class.chip-on]="filter() === f.id" [attr.aria-pressed]="filter() === f.id" (click)="setFilter(f.id)">{{ f.label }}</button>
        }
      </div>

      @if (filter() === 'artists') {
        @if (artists() === null) { <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">@for (i of [1,2,3,4,5,6]; track i) { <div class="p-2.5"><div class="skeleton aspect-square !rounded-full"></div></div> }</div> }
        @else if (artists()!.length) {
          <div class="-mx-2.5 mt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
            @for (a of artists(); track a.id) { <app-media-card [link]="['/artist', a.id]" [title]="a.name" subtitle="Artist" [image]="a.image" [round]="true" (play)="player.playContext(a.uri)" /> }
          </div>
        } @else { <app-empty class="mt-4" icon="user" title="You don't follow any artists yet" text="Follow artists to see their new releases on Melodify." /> }
      } @else {
        @if (!lib.loaded()) { <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">@for (i of [1,2,3,4,5,6]; track i) { <div class="p-2.5"><div class="skeleton aspect-square"></div></div> }</div> }
        @else if (shown().length) {
          <div class="-mx-2.5 mt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6" data-testid="playlist-grid">
            @for (p of shown(); track p.id) {
              <app-media-card [link]="['/playlist', p.id]" [title]="p.name" [subtitle]="(p.isOwn ? 'By you' : 'By ' + (p.owner.name ?? 'Spotify')) + ' · ' + p.trackCount + ' songs'" [image]="p.image" (play)="player.playContext(p.uri)" />
            }
          </div>
        } @else { <app-empty class="mt-4" icon="library" title="No playlists here" text="Create one above or save playlists on Spotify." /> }
      }
    </div>
  `,
})
export class LibraryPage {
  private api = inject(Api);
  private toast = inject(ToastService);
  private router = inject(Router);
  lib = inject(LibraryService);
  player = inject(PlayerService);

  filters: { id: Filter; label: string }[] = [{ id: 'all', label: 'All' }, { id: 'mine', label: 'Made by you' }, { id: 'followed', label: 'Saved' }, { id: 'artists', label: 'Artists' }];
  ranges: Range[] = ['short', 'medium', 'long'];
  rangeLabel = RANGE_LABEL;
  filter = signal<Filter>('all');
  tool = signal<Tool>(null);
  busy = signal(false);
  artists = signal<Artist[] | null>(null);
  picked = signal(new Set<string>());
  name = ''; desc = ''; range: Range = 'short'; count = 30; removeDupes = true;

  mine = computed(() => this.lib.playlists().filter(p => p.isOwn));
  mineCount = computed(() => this.mine().length);
  shown = computed(() => {
    const f = this.filter(), all = this.lib.playlists();
    return f === 'mine' ? all.filter(p => p.isOwn) : f === 'followed' ? all.filter(p => !p.isOwn) : all;
  });

  constructor() { if (!this.lib.loaded()) this.lib.load(); }

  setFilter(f: Filter) {
    this.filter.set(f);
    if (f === 'artists' && this.artists() === null) this.api.followed().subscribe({ next: a => this.artists.set(a), error: e => { this.artists.set([]); this.toast.error(errorText(e)); } });
  }
  openTool(t: Tool) { this.tool.set(this.tool() === t ? null : t); this.name = ''; this.desc = ''; }
  togglePick(id: string) { this.picked.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  submit() {
    const t = this.tool();
    const name = this.name.trim() || null;
    const req = t === 'new' ? this.api.createPlaylist(this.name.trim(), this.desc.trim() || undefined)
      : t === 'top' ? this.api.fromTop(this.range, this.count, name ?? undefined)
      : this.api.merge([...this.picked()], name, this.removeDupes);
    this.busy.set(true);
    req.subscribe({
      next: (p: Playlist) => {
        this.busy.set(false); this.tool.set(null); this.picked.set(new Set());
        this.lib.playlists.update(l => [p, ...l]);
        this.toast.show(`Created “${p.name}”`);
        this.router.navigate(['/playlist', p.id]);
      },
      error: e => { this.busy.set(false); this.toast.error(errorText(e)); },
    });
  }
}
