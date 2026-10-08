import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { Api } from '../core/api.service';
import { NamesPipe, YearPipe } from '../core/format';
import { errorText } from '../core/http';
import { SearchResult } from '../core/models';
import { PlayerService } from '../core/player.service';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { MediaCardComponent } from '../shared/media-card.component';
import { TrackListComponent } from '../shared/track-list.component';

@Component({
  selector: 'app-search',
  imports: [FormsModule, NamesPipe, YearPipe, EmptyStateComponent, IconComponent, MediaCardComponent, TrackListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page py-8">
      <h1 class="sr-only">Search</h1>
      <div class="relative max-w-xl">
        <app-icon name="search" [size]="18" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input class="input h-12 rounded-full pl-11 pr-11 text-base" type="search" placeholder="Songs, artists, albums or playlists" aria-label="Search Spotify"
               [ngModel]="text()" (ngModelChange)="onType($event)" autofocus data-testid="search" />
        @if (text()) { <button type="button" class="btn-icon absolute right-1.5 top-1/2 h-9 w-9 -translate-y-1/2 text-ink-faint hover:text-ink" (click)="onType('')" aria-label="Clear search"><app-icon name="x" [size]="16" /></button> }
      </div>

      @if (!text().trim()) {
        <app-empty class="mt-10" icon="search" title="Search Spotify" text="Find songs to queue or add to your playlists, and artists to follow." />
      } @else if (loading() && !result()) {
        <div class="mt-8 space-y-2">@for (i of [1,2,3,4,5]; track i) { <div class="skeleton h-12"></div> }</div>
      } @else if (error()) {
        <app-empty class="mt-10" icon="ban" title="Search failed" [text]="error()" />
      } @else if (result()) {
        @let r = result()!;
        @if (!r.tracks.length && !r.artists.length && !r.albums.length && !r.playlists.length) {
          <app-empty class="mt-10" icon="search" [title]="'No results for “' + text().trim() + '”'" text="Check the spelling or try fewer words." />
        } @else {
          @if (r.tracks.length) {
            <section class="mt-8" aria-labelledby="songs-h"><h2 id="songs-h" class="h2">Songs</h2>
              <app-track-list class="mt-2" [tracks]="r.tracks.slice(0, 8)" (play)="player.playUris([r.tracks[$event].uri])" />
            </section>
          }
          @if (r.artists.length) {
            <section class="mt-8" aria-labelledby="artists-h"><h2 id="artists-h" class="h2">Artists</h2>
              <div class="scroller -mx-2.5 mt-2">
                @for (a of r.artists; track a.id) { <app-media-card class="w-40 shrink-0 snap-start" [link]="['/artist', a.id]" [title]="a.name" subtitle="Artist" [image]="a.image" [round]="true" (play)="player.playContext(a.uri)" /> }
              </div>
            </section>
          }
          @if (r.albums.length) {
            <section class="mt-6" aria-labelledby="albums-h"><h2 id="albums-h" class="h2">Albums</h2>
              <div class="scroller -mx-2.5 mt-2">
                @for (a of r.albums; track a.id) { <app-media-card class="w-40 shrink-0 snap-start" [link]="['/album', a.id]" [title]="a.name" [subtitle]="(a.releaseDate | year) + ' · ' + (a.artists | names)" [image]="a.image" (play)="player.playContext(a.uri)" /> }
              </div>
            </section>
          }
          @if (r.playlists.length) {
            <section class="mt-6" aria-labelledby="pl-h"><h2 id="pl-h" class="h2">Playlists</h2>
              <div class="scroller -mx-2.5 mt-2">
                @for (p of r.playlists; track p.id) { <app-media-card class="w-40 shrink-0 snap-start" [link]="['/playlist', p.id]" [title]="p.name" [subtitle]="'By ' + (p.owner.name ?? 'Spotify')" [image]="p.image" (play)="player.playContext(p.uri)" /> }
              </div>
            </section>
          }
        }
      }
    </div>
  `,
})
export class SearchPage implements OnInit {
  q = input<string>();
  private api = inject(Api);
  private router = inject(Router);
  private destroy = inject(DestroyRef);
  player = inject(PlayerService);
  text = signal('');
  result = signal<SearchResult | null>(null);
  loading = signal(false);
  error = signal('');
  private input$ = new Subject<string>();

  ngOnInit() {
    this.input$.pipe(
      debounceTime(300), distinctUntilChanged(),
      tap(q => { this.router.navigate([], { queryParams: { q: q.trim() || null }, replaceUrl: true }); this.error.set(''); }),
      switchMap(q => {
        if (!q.trim()) { this.result.set(null); return of(null); }
        this.loading.set(true);
        return this.api.search(q.trim()).pipe(catchError(e => { this.error.set(errorText(e)); return of(null); }));
      }),
      takeUntilDestroyed(this.destroy),
    ).subscribe(r => { this.loading.set(false); if (r) this.result.set(r); });
    if (this.q()) this.onType(this.q()!);
  }

  onType(v: string) { this.text.set(v); if (!v.trim()) this.result.set(null); this.input$.next(v); }
}
