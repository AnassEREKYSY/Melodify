import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, NgZone, computed, effect, inject, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { Api } from './api.service';
import { AuthService } from './auth.service';
import { errorText } from './http';
import { Device, PlayerState } from './models';
import { ToastService } from './toast.service';

declare global { interface Window { Spotify?: any; onSpotifyWebPlaybackSDKReady?: () => void; } }

/**
 * Spotify Connect remote: polls the playback state and sends commands.
 * "Play in this browser" uses the Web Playback SDK (Spotify Premium only).
 */
@Injectable({ providedIn: 'root' })
export class PlayerService {
  private api = inject(Api);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private zone = inject(NgZone);

  readonly state = signal<PlayerState | null>(null);
  readonly devices = signal<Device[]>([]);
  readonly needsDevice = signal(false);
  readonly browserDeviceId = signal<string | null>(null);
  readonly browserLoading = signal(false);
  private localProgress = signal(0);
  private sdkPlayer: any = null;
  private pollId: ReturnType<typeof setInterval> | null = null;
  private tickId: ReturnType<typeof setInterval> | null = null;

  readonly track = computed(() => this.state()?.track ?? null);
  readonly progress = computed(() => Math.min(this.localProgress(), this.track()?.durationMs ?? 0));

  constructor() {
    effect(() => (this.auth.signedIn() ? this.start() : this.stop()));
  }

  private start() {
    if (this.pollId) return;
    this.refresh();
    this.zone.runOutsideAngular(() => {
      this.pollId = setInterval(() => { if (document.visibilityState === 'visible') this.zone.run(() => this.refresh()); }, 5000);
      this.tickId = setInterval(() => { if (this.state()?.isPlaying) this.zone.run(() => this.localProgress.update(p => p + 1000)); }, 1000);
    });
  }
  private stop() {
    if (this.pollId) clearInterval(this.pollId);
    if (this.tickId) clearInterval(this.tickId);
    this.pollId = this.tickId = null;
    this.sdkPlayer?.disconnect(); this.sdkPlayer = null;
    this.state.set(null);
  }

  refresh() {
    this.api.player().subscribe({
      next: s => { this.state.set(s); this.localProgress.set(s?.progressMs ?? 0); },
      error: () => {},
    });
  }
  loadDevices() { this.api.devices().subscribe({ next: d => this.devices.set(d), error: () => this.devices.set([]) }); }

  // Commands --------------------------------------------------------------

  playUris(uris: string[], offset = 0) { return this.run(this.api.play({ uris: uris.slice(0, 100), offset, deviceId: this.targetDevice() })); }
  playContext(contextUri: string, offset?: number) { return this.run(this.api.play({ contextUri, offset, deviceId: this.targetDevice() })); }
  toggle() {
    const s = this.state();
    if (!s?.track) return this.run(this.api.play({ deviceId: this.targetDevice() }));
    this.state.set({ ...s, isPlaying: !s.isPlaying });
    return this.run(s.isPlaying ? this.api.pause() : this.api.play({}));
  }
  next() { return this.run(this.api.next()); }
  previous() { return this.run(this.api.previous()); }
  seek(ms: number) { this.localProgress.set(ms); return this.run(this.api.seek(Math.round(ms)), false); }
  setVolume(p: number) { return this.run(this.api.volume(Math.round(p)), false); }
  shuffle() { const s = this.state(); return s && this.run(this.api.shuffle(!s.shuffle)); }
  repeat() {
    const s = this.state(); if (!s) return;
    const next = s.repeat === 'off' ? 'context' : s.repeat === 'context' ? 'track' : 'off';
    return this.run(this.api.repeat(next));
  }
  queue(uri: string) {
    this.api.queue(uri).subscribe({ next: () => this.toast.show('Added to queue'), error: e => this.handle(e) });
  }
  transfer(d: Device) {
    if (!d.id) return;
    this.api.transfer(d.id).subscribe({
      next: () => { this.needsDevice.set(false); this.toast.show(`Playing on ${d.name}`); setTimeout(() => this.refresh(), 600); },
      error: e => this.handle(e),
    });
  }

  /** Registers this tab as a Spotify Connect device (Premium) and moves playback to it. */
  async useThisBrowser() {
    if (this.browserDeviceId()) return this.transfer({ id: this.browserDeviceId(), name: 'this browser', type: 'Computer', isActive: false, isRestricted: false, volumePercent: null });
    if (!this.auth.premium()) return this.toast.error('Playing in the browser needs Spotify Premium.');
    this.browserLoading.set(true);
    try {
      await loadSdk();
      const player = new window.Spotify!.Player({
        name: 'Melodify (web)',
        volume: 0.7,
        getOAuthToken: async (cb: (t: string) => void) => {
          const t = this.auth.expiresSoon ? await firstValueFrom(this.auth.refresh()) : this.auth.token;
          if (t) cb(t);
        },
      });
      player.addListener('ready', ({ device_id }: { device_id: string }) => this.zone.run(() => {
        this.browserDeviceId.set(device_id);
        this.browserLoading.set(false);
        this.transfer({ id: device_id, name: 'this browser', type: 'Computer', isActive: false, isRestricted: false, volumePercent: 70 });
      }));
      player.addListener('player_state_changed', () => this.zone.run(() => this.refresh()));
      for (const ev of ['initialization_error', 'authentication_error', 'account_error']) {
        player.addListener(ev, ({ message }: { message: string }) => this.zone.run(() => {
          this.browserLoading.set(false);
          this.toast.error(ev === 'account_error' ? 'Playing in the browser needs Spotify Premium.' : `Browser player: ${message}`);
        }));
      }
      this.sdkPlayer = player;
      await player.connect();
    } catch {
      this.browserLoading.set(false);
      this.toast.error('The Spotify player could not load in this browser.');
    }
  }

  private targetDevice() { return this.state()?.device?.id ?? this.browserDeviceId() ?? null; }

  private run(o: Observable<unknown>, refreshAfter = true) {
    o.subscribe({ next: () => refreshAfter && setTimeout(() => this.refresh(), 450), error: e => this.handle(e) });
  }

  private handle(e: unknown) {
    if (e instanceof HttpErrorResponse && e.status === 404) {
      this.needsDevice.set(true);
      this.loadDevices();
      return;
    }
    this.toast.error(errorText(e));
  }
}

let sdk: Promise<void> | null = null;
function loadSdk(): Promise<void> {
  if (window.Spotify) return Promise.resolve();
  sdk ??= new Promise((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = () => resolve();
    const s = document.createElement('script');
    s.src = 'https://sdk.scdn.co/spotify-player.js';
    s.async = true;
    s.onerror = () => { sdk = null; reject(new Error('sdk')); };
    document.head.appendChild(s);
  });
  return sdk;
}
