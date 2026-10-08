import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MmssPipe, NamesPipe } from '../core/format';
import { LibraryService } from '../core/library.service';
import { Device } from '../core/models';
import { PlayerService } from '../core/player.service';
import { CoverComponent } from './cover.component';
import { IconComponent } from './icon.component';

/** Now playing, controls, progress, volume and the device picker. */
@Component({
  selector: 'app-player-bar',
  imports: [RouterLink, MmssPipe, NamesPipe, CoverComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let s = p.state();
    @let t = p.track();
    <div class="grid h-[72px] grid-cols-[1fr_auto] items-center gap-3 border-t border-line/[0.08] bg-bg/95 px-3 backdrop-blur md:h-20 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] md:px-4">
      <!-- Now playing -->
      <div class="flex min-w-0 items-center gap-3">
        @if (t) {
          <app-cover class="w-12 shrink-0 md:w-14" [src]="t.album?.image" [small]="true" />
          <div class="min-w-0">
            @if (t.album) { <a [routerLink]="['/album', t.album.id]" class="block truncate text-sm font-medium hover:underline">{{ t.name }}</a> }
            @else { <p class="truncate text-sm font-medium">{{ t.name }}</p> }
            <p class="truncate text-[13px] text-ink-faint">{{ t.artists | names }}</p>
          </div>
          <button type="button" class="btn-icon hidden h-8 w-8 shrink-0 md:inline-flex" [class]="lib.liked().has(t.id) ? 'text-accent' : 'text-ink-faint hover:text-ink'"
                  (click)="lib.toggleLike(t.id)" [attr.aria-label]="lib.liked().has(t.id) ? 'Remove from Liked songs' : 'Save to Liked songs'"><app-icon name="heart" [size]="16" [fill]="lib.liked().has(t.id)" /></button>
        } @else {
          <span class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-raised text-ink-faint md:h-14 md:w-14"><app-icon name="music" /></span>
          <div class="min-w-0"><p class="truncate text-sm text-ink-muted">Nothing playing</p><p class="truncate text-[13px] text-ink-faint">Start something on any device</p></div>
        }
      </div>

      <!-- Controls -->
      <div class="flex flex-col items-center gap-1">
        <div class="flex items-center gap-1 md:gap-2">
          <button type="button" class="btn-icon hidden h-8 w-8 md:inline-flex" [class]="s?.shuffle ? 'text-accent' : 'text-ink-faint hover:text-ink'" (click)="p.shuffle()" aria-label="Shuffle" [attr.aria-pressed]="s?.shuffle"><app-icon name="shuffle" [size]="16" /></button>
          <button type="button" class="btn-icon hidden h-8 w-8 text-ink-muted hover:text-ink md:inline-flex" (click)="p.previous()" aria-label="Previous"><app-icon name="skip-back" [size]="18" [fill]="true" /></button>
          <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-bg transition hover:scale-105" (click)="p.toggle()" [attr.aria-label]="s?.isPlaying ? 'Pause' : 'Play'">
            <app-icon [name]="s?.isPlaying ? 'pause' : 'play'" [size]="18" [fill]="true" [stroke]="0" />
          </button>
          <button type="button" class="btn-icon h-8 w-8 text-ink-muted hover:text-ink" (click)="p.next()" aria-label="Next"><app-icon name="skip-forward" [size]="18" [fill]="true" /></button>
          <button type="button" class="btn-icon relative hidden h-8 w-8 md:inline-flex" [class]="s && s.repeat !== 'off' ? 'text-accent' : 'text-ink-faint hover:text-ink'" (click)="p.repeat()" [attr.aria-label]="'Repeat: ' + (s?.repeat ?? 'off')">
            <app-icon name="repeat" [size]="16" />@if (s?.repeat === 'track') { <span class="absolute right-1 top-1 text-[9px] font-bold">1</span> }
          </button>
          <button type="button" class="btn-icon h-8 w-8 md:hidden" [class]="s?.device ? 'text-accent' : 'text-ink-faint'" (click)="openDevices()" aria-label="Devices" data-devices><app-icon name="speaker" [size]="18" /></button>
        </div>
        @if (t) {
          <div class="hidden w-full max-w-xl items-center gap-2 md:flex">
            <span class="w-10 text-right text-2xs tabular-nums text-ink-faint">{{ p.progress() | mmss }}</span>
            <input type="range" class="range flex-1" min="0" [max]="t.durationMs" [value]="p.progress()" (change)="p.seek(+$any($event.target).value)" aria-label="Seek" />
            <span class="w-10 text-2xs tabular-nums text-ink-faint">{{ t.durationMs | mmss }}</span>
          </div>
        }
      </div>

      <!-- Device + volume -->
      <div class="relative hidden items-center justify-end gap-2 md:flex">
        @if (s?.device; as d) { <span class="hidden truncate text-[13px] text-accent lg:inline">{{ d.name }}</span> }
        <button type="button" class="btn-icon h-8 w-8" [class]="s?.device ? 'text-accent' : 'text-ink-faint hover:text-ink'" (click)="openDevices()" aria-label="Devices" data-devices><app-icon name="speaker" [size]="18" /></button>
        <app-icon [name]="(s?.device?.volumePercent ?? 1) === 0 ? 'volume-x' : 'volume'" [size]="16" class="text-ink-faint" />
        <input type="range" class="range w-24" min="0" max="100" [value]="s?.device?.volumePercent ?? 50" (change)="p.setVolume(+$any($event.target).value)" aria-label="Volume" [disabled]="!s?.device" />
      </div>
    </div>

    @if (devicesOpen() || p.needsDevice()) {
      <div class="absolute bottom-[84px] right-3 z-50 w-[min(92vw,340px)] rounded-card border border-line/[0.1] bg-raised p-2 shadow-2xl shadow-black/60 md:bottom-24" data-devices role="dialog" aria-label="Devices">
        <div class="flex items-center justify-between px-2 py-1.5">
          <p class="text-sm font-semibold">{{ p.needsDevice() ? 'Pick a device to play on' : 'Connect to a device' }}</p>
          <button type="button" class="btn-icon h-7 w-7 text-ink-faint" (click)="close()" aria-label="Close"><app-icon name="x" [size]="16" /></button>
        </div>
        <ul class="mt-1">
          @for (d of p.devices(); track d.id) {
            <li>
              <button type="button" class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-surface disabled:opacity-50" (click)="pick(d)" [disabled]="d.isRestricted">
                <app-icon [name]="icon(d)" [size]="18" [class]="d.isActive ? 'text-accent' : 'text-ink-muted'" />
                <span class="flex-1"><span class="block text-sm" [class.text-accent]="d.isActive">{{ d.name }}</span><span class="text-2xs text-ink-faint">{{ d.isActive ? 'Playing here' : d.type }}</span></span>
              </button>
            </li>
          } @empty {
            <li class="px-2.5 py-3 text-[13px] text-ink-muted">No device found. Open Spotify on your phone or computer, or play right here.</li>
          }
        </ul>
        <div class="mt-1 border-t border-line/[0.08] pt-2">
          <button type="button" class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-surface" (click)="p.useThisBrowser()" [disabled]="p.browserLoading()">
            <app-icon name="laptop" [size]="18" class="text-ink-muted" />
            <span class="flex-1"><span class="block text-sm">{{ p.browserLoading() ? 'Connecting…' : 'Play in this browser' }}</span><span class="text-2xs text-ink-faint">Spotify Premium</span></span>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .range { appearance: none; height: 4px; border-radius: 999px; background: rgb(var(--line) / 0.18); cursor: pointer; }
    .range::-webkit-slider-thumb { appearance: none; width: 12px; height: 12px; border-radius: 999px; background: rgb(var(--ink)); }
    .range::-moz-range-thumb { width: 12px; height: 12px; border: 0; border-radius: 999px; background: rgb(var(--ink)); }
    .range:hover { accent-color: rgb(var(--accent)); }
  `],
})
export class PlayerBarComponent {
  p = inject(PlayerService);
  lib = inject(LibraryService);
  devicesOpen = signal(false);

  openDevices() { this.devicesOpen.set(!this.devicesOpen()); if (this.devicesOpen()) this.p.loadDevices(); }
  close() { this.devicesOpen.set(false); this.p.needsDevice.set(false); }
  pick(d: Device) { this.p.transfer(d); this.close(); }
  icon(d: Device) { return d.type === 'Smartphone' ? 'smartphone' : d.type === 'Computer' ? 'laptop' : 'speaker'; }

  @HostListener('document:click', ['$event'])
  outside(e: MouseEvent) { if ((this.devicesOpen() || this.p.needsDevice()) && !(e.target as HTMLElement).closest('[data-devices]')) this.close(); }
}
