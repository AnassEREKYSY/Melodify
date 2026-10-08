import { ChangeDetectionStrategy, Component, HostListener, computed, effect, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MmssPipe } from '../core/format';
import { LibraryService } from '../core/library.service';
import { Track } from '../core/models';
import { PlayerService } from '../core/player.service';
import { CoverComponent } from './cover.component';
import { IconComponent } from './icon.component';

/** Track rows: click to play, like, queue, add to playlist, remove (own playlists). */
@Component({
  selector: 'app-track-list',
  imports: [RouterLink, MmssPipe, CoverComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (showHeader()) {
      <div class="grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-line/[0.07] px-3 pb-2 text-2xs font-medium uppercase tracking-wider text-ink-faint md:grid-cols-[2rem_minmax(0,1.4fr)_minmax(0,1fr)_auto]">
        <span class="text-right">#</span><span>Title</span><span class="hidden md:block">{{ showAlbum() ? 'Album' : '' }}</span><span class="pr-20 text-right"><span class="sr-only">Duration</span></span>
      </div>
    }
    <ol class="mt-1">
      @for (t of tracks(); track t.uri + $index; let i = $index) {
        <li class="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg px-3 py-1.5 transition-colors hover:bg-raised md:grid-cols-[2rem_minmax(0,1.4fr)_minmax(0,1fr)_auto]"
            [class.!bg-raised]="menu() === i" (dblclick)="play.emit(i)">
          <button type="button" class="relative flex h-8 items-center justify-end text-sm tabular-nums text-ink-faint" (click)="play.emit(i)" [attr.aria-label]="'Play ' + t.name" [disabled]="t.isLocal">
            @if (isCurrent(t)) { <app-icon name="volume" [size]="15" class="text-accent" /> }
            @else { <span class="group-hover:hidden">{{ rank() ? rank()! + i : i + 1 }}</span><app-icon name="play" [size]="14" [fill]="true" class="hidden text-ink group-hover:block" /> }
          </button>
          <div class="flex min-w-0 items-center gap-3">
            @if (showCover()) { <app-cover class="w-10 shrink-0" [src]="t.album?.image" [small]="true" /> }
            <div class="min-w-0">
              <p class="truncate text-[15px]" [class.text-accent]="isCurrent(t)">{{ t.name }}</p>
              <p class="truncate text-[13px] text-ink-faint">
                @if (t.explicit) { <span class="mr-1 rounded-sm bg-ink-faint/30 px-1 text-[10px] font-semibold text-ink-muted">E</span> }
                @for (a of t.artists; track a.id; let last = $last) { <a [routerLink]="['/artist', a.id]" class="hover:text-ink hover:underline">{{ a.name }}</a>{{ last ? '' : ', ' }} }
              </p>
            </div>
          </div>
          <div class="hidden min-w-0 md:block">
            @if (showAlbum() && t.album) { <a [routerLink]="['/album', t.album.id]" class="block truncate text-[13px] text-ink-faint hover:text-ink hover:underline">{{ t.album.name }}</a> }
          </div>
          <div class="relative flex items-center justify-end gap-1">
            <button type="button" class="btn-icon h-8 w-8 transition" [class]="liked().has(t.id) ? 'text-accent' : 'text-ink-faint opacity-0 hover:text-ink group-hover:opacity-100 focus-visible:opacity-100 max-md:hidden'"
                    (click)="lib.toggleLike(t.id)" [attr.aria-label]="(liked().has(t.id) ? 'Remove from' : 'Save to') + ' Liked songs'" [attr.aria-pressed]="liked().has(t.id)" [disabled]="t.isLocal">
              <app-icon name="heart" [size]="16" [fill]="liked().has(t.id)" />
            </button>
            <span class="hidden w-11 text-right text-[13px] tabular-nums text-ink-faint sm:inline">{{ t.durationMs | mmss }}</span>
            <button type="button" class="btn-icon h-8 w-8 text-ink-faint opacity-0 hover:text-ink group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100" [class.opacity-100]="menu() === i"
                    (click)="toggleMenu(i, $event)" aria-label="More options" [attr.aria-expanded]="menu() === i" data-menu>
              <app-icon name="more" [size]="18" />
            </button>
            @if (menu() === i) {
              <div class="absolute right-0 top-9 z-30 w-56 rounded-card border border-line/[0.1] bg-raised p-1.5 shadow-2xl shadow-black/50" data-menu role="menu">
                <button type="button" class="menu-item md:hidden" role="menuitem" (click)="lib.toggleLike(t.id); menu.set(null)"><app-icon name="heart" [size]="16" [fill]="liked().has(t.id)" /> {{ liked().has(t.id) ? 'Remove from Liked songs' : 'Save to Liked songs' }}</button>
                <button type="button" class="menu-item" role="menuitem" (click)="player.queue(t.uri); menu.set(null)"><app-icon name="list-plus" [size]="16" /> Add to queue</button>
                <button type="button" class="menu-item" role="menuitem" (click)="sub.set(!sub())"><app-icon name="plus" [size]="16" /> Add to playlist <app-icon name="chevron-right" [size]="14" class="ml-auto" /></button>
                @if (sub()) {
                  <div class="max-h-56 overflow-y-auto border-t border-line/[0.08] py-1">
                    @for (p of ownPlaylists(); track p.id) {
                      <button type="button" class="menu-item pl-8" role="menuitem" (click)="lib.addTo(p, [t.uri]); menu.set(null)"><span class="truncate">{{ p.name }}</span></button>
                    } @empty { <p class="px-3 py-2 text-[13px] text-ink-faint">No playlists of yours yet.</p> }
                  </div>
                }
                @if (t.album) { <a class="menu-item" role="menuitem" [routerLink]="['/album', t.album.id]"><app-icon name="disc" [size]="16" /> Go to album</a> }
                @if (t.artists[0]) { <a class="menu-item" role="menuitem" [routerLink]="['/artist', t.artists[0].id]"><app-icon name="user" [size]="16" /> Go to artist</a> }
                @if (canRemove()) {
                  <div class="my-1 border-t border-line/[0.08]"></div>
                  <button type="button" class="menu-item !text-danger" role="menuitem" (click)="remove.emit(t); menu.set(null)"><app-icon name="trash" [size]="16" /> Remove from this playlist</button>
                }
              </div>
            }
          </div>
        </li>
      }
    </ol>
  `,
  styles: [`:host ::ng-deep .menu-item { display:flex; width:100%; align-items:center; gap:.625rem; border-radius:.375rem; padding:.5rem .625rem; font-size:.875rem; color: rgb(var(--ink-muted)); text-align:left; }
            :host ::ng-deep .menu-item:hover { background: rgb(var(--surface)); color: rgb(var(--ink)); }`],
})
export class TrackListComponent {
  tracks = input.required<Track[]>();
  showCover = input(true);
  showAlbum = input(true);
  showHeader = input(false);
  canRemove = input(false);
  rank = input<number | null>(null);
  play = output<number>();
  remove = output<Track>();

  lib = inject(LibraryService);
  player = inject(PlayerService);
  liked = this.lib.liked;
  menu = signal<number | null>(null);
  sub = signal(false);
  ownPlaylists = computed(() => this.lib.playlists().filter(p => p.isOwn));

  constructor() {
    effect(() => { const ids = this.tracks().map(t => t.id); if (ids.length) this.lib.checkLiked(ids); });
  }

  isCurrent(t: Track) { return this.player.track()?.id === t.id && !!t.id; }
  toggleMenu(i: number, e: Event) { e.stopPropagation(); this.sub.set(false); this.menu.set(this.menu() === i ? null : i); }

  @HostListener('document:click', ['$event'])
  outside(e: MouseEvent) { if (this.menu() !== null && !(e.target as HTMLElement).closest('[data-menu]')) this.menu.set(null); }
}
