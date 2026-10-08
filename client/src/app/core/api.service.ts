import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Album, Artist, ArtistPage, Device, Paged, PlayerState, Playlist, PlaylistDetail, PlaylistStats, Range, SearchResult, Stats, Track, User } from './models';

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);
  private b = environment.apiUrl;

  // Auth
  loginUrl() { return this.http.get<{ url: string; state: string }>(`${this.b}/spotify-auth/get-url-login`); }
  exchange(code: string) { return this.http.get<{ user: User; accessToken: string; expiresIn: number; refreshToken: string }>(`${this.b}/spotify-auth/exchange`, { params: { code } }); }
  refresh(refreshToken: string) { return this.http.post<{ accessToken: string; expiresIn: number; refreshToken: string }>(`${this.b}/spotify-auth/refresh`, { refreshToken }); }

  // Me
  me() { return this.http.get<User>(`${this.b}/me`); }
  topArtists(range: Range, limit = 20) { return this.http.get<Artist[]>(`${this.b}/me/top/artists`, { params: { range, limit } }); }
  topTracks(range: Range, limit = 20) { return this.http.get<Track[]>(`${this.b}/me/top/tracks`, { params: { range, limit } }); }
  recent() { return this.http.get<Track[]>(`${this.b}/me/recent`); }
  stats(range: Range) { return this.http.get<Stats>(`${this.b}/me/stats`, { params: { range, tz: -new Date().getTimezoneOffset() } }); }
  liked(offset = 0) { return this.http.get<Paged<Track>>(`${this.b}/me/tracks`, { params: { offset, limit: 50 } }); }
  likedContains(ids: string[]) { return this.http.get<boolean[]>(`${this.b}/me/tracks/contains`, { params: { ids: ids.join(',') } }); }
  like(id: string) { return this.http.put(`${this.b}/me/tracks/${id}`, {}); }
  unlike(id: string) { return this.http.delete(`${this.b}/me/tracks/${id}`); }

  // Playlists
  playlists() { return this.http.get<Playlist[]>(`${this.b}/playlists`); }
  playlist(id: string) { return this.http.get<PlaylistDetail>(`${this.b}/playlists/${id}`); }
  playlistStats(id: string) { return this.http.get<PlaylistStats>(`${this.b}/playlists/${id}/stats`); }
  createPlaylist(name: string, description?: string) { return this.http.post<Playlist>(`${this.b}/playlists`, { name, description, public: false }); }
  updatePlaylist(id: string, name: string, description: string | null) { return this.http.put(`${this.b}/playlists/${id}`, { name, description, public: false }); }
  deletePlaylist(id: string) { return this.http.delete(`${this.b}/playlists/${id}`); }
  addTracks(id: string, uris: string[]) { return this.http.post(`${this.b}/playlists/${id}/tracks`, { uris }); }
  removeTracks(id: string, uris: string[]) { return this.http.delete(`${this.b}/playlists/${id}/tracks`, { body: { uris } }); }
  dedupe(id: string) { return this.http.post<{ removed: number; trackCount: number }>(`${this.b}/playlists/${id}/dedupe`, {}); }
  sort(id: string, by: string, descending: boolean) { return this.http.post<{ trackCount: number }>(`${this.b}/playlists/${id}/sort`, { by, descending }); }
  merge(playlistIds: string[], name: string | null, removeDuplicates: boolean) { return this.http.post<Playlist>(`${this.b}/playlists/merge`, { playlistIds, name, removeDuplicates }); }
  fromTop(range: Range, limit: number, name?: string) { return this.http.post<Playlist>(`${this.b}/playlists/from-top`, { range, limit, name }); }

  // Catalog
  followed() { return this.http.get<Artist[]>(`${this.b}/artists/followed`); }
  artist(id: string) { return this.http.get<ArtistPage>(`${this.b}/artists/${id}`); }
  follow(id: string) { return this.http.put(`${this.b}/artists/${id}/follow`, {}); }
  unfollow(id: string) { return this.http.delete(`${this.b}/artists/${id}/follow`); }
  album(id: string) { return this.http.get<Album>(`${this.b}/albums/${id}`); }
  search(q: string) { return this.http.get<SearchResult>(`${this.b}/search`, { params: { q } }); }
  releases(days: number) { return this.http.get<Album[]>(`${this.b}/releases`, { params: { days } }); }

  // Player
  player() { return this.http.get<PlayerState | null>(`${this.b}/player`); }
  devices() { return this.http.get<Device[]>(`${this.b}/player/devices`); }
  play(body: { deviceId?: string | null; contextUri?: string; uris?: string[]; offset?: number } = {}) { return this.http.put(`${this.b}/player/play`, body); }
  pause() { return this.http.put(`${this.b}/player/pause`, {}); }
  next() { return this.http.post(`${this.b}/player/next`, {}); }
  previous() { return this.http.post(`${this.b}/player/previous`, {}); }
  transfer(deviceId: string, play = true) { return this.http.put(`${this.b}/player/device`, { deviceId, play }); }
  volume(percent: number) { return this.http.put(`${this.b}/player/volume`, {}, { params: new HttpParams().set('percent', percent) }); }
  seek(positionMs: number) { return this.http.put(`${this.b}/player/seek`, {}, { params: { positionMs } }); }
  shuffle(state: boolean) { return this.http.put(`${this.b}/player/shuffle`, {}, { params: { state } }); }
  repeat(state: string) { return this.http.put(`${this.b}/player/repeat`, {}, { params: { state } }); }
  queue(uri: string) { return this.http.post(`${this.b}/player/queue`, {}, { params: { uri } }); }
}
