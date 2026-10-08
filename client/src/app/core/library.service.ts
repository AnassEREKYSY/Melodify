import { Injectable, inject, signal } from '@angular/core';
import { Api } from './api.service';
import { errorText } from './http';
import { Playlist } from './models';
import { ToastService } from './toast.service';

/** The user's playlists (sidebar, add-to-playlist menu) and liked-song ids, shared across pages. */
@Injectable({ providedIn: 'root' })
export class LibraryService {
  private api = inject(Api);
  private toast = inject(ToastService);
  readonly playlists = signal<Playlist[]>([]);
  readonly loaded = signal(false);
  readonly liked = signal(new Set<string>());

  load() {
    this.api.playlists().subscribe({ next: p => { this.playlists.set(p); this.loaded.set(true); }, error: () => this.loaded.set(true) });
  }

  /** Checks which of these tracks are liked (batches of 50). */
  checkLiked(ids: string[]) {
    const unique = [...new Set(ids.filter(Boolean))];
    for (let i = 0; i < unique.length; i += 50) {
      const batch = unique.slice(i, i + 50);
      this.api.likedContains(batch).subscribe(r => this.liked.update(s => {
        const n = new Set(s);
        batch.forEach((id, k) => (r[k] ? n.add(id) : n.delete(id)));
        return n;
      }));
    }
  }

  toggleLike(id: string) {
    const on = !this.liked().has(id);
    this.liked.update(s => { const n = new Set(s); on ? n.add(id) : n.delete(id); return n; });
    (on ? this.api.like(id) : this.api.unlike(id)).subscribe({
      next: () => this.toast.show(on ? 'Added to Liked songs' : 'Removed from Liked songs'),
      error: e => { this.liked.update(s => { const n = new Set(s); on ? n.delete(id) : n.add(id); return n; }); this.toast.error(errorText(e)); },
    });
  }

  addTo(p: Playlist, uris: string[]) {
    this.api.addTracks(p.id, uris).subscribe({
      next: () => { this.toast.show(`Added to ${p.name}`); this.playlists.update(l => l.map(x => (x.id === p.id ? { ...x, trackCount: x.trackCount + uris.length } : x))); },
      error: e => this.toast.error(errorText(e)),
    });
  }
}
