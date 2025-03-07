import { Injectable } from '@angular/core';
import { environment } from '../../../environments/envirnoment.developement';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpotifyPaginatedPlaylists } from '../models/SpotifyPaginatedPlaylists.model';
import { Playlist } from '../models/Playlist.model';
import { CreatePlaylist } from '../Dtos/CreatePlaylist.dto';
import { AddRemoveSong } from '../Dtos/AddSong.dto';
import { Song } from '../models/Song.model';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getSpotifyPlaylistsByUserId(offset: number = 0, limit: number = 20): Observable<SpotifyPaginatedPlaylists> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<SpotifyPaginatedPlaylists>(`${this.apiUrl}playlists/spotify-by-user?offset=${offset}&limit=${limit}`, { headers });
  }

  createPlaylist(playlistData: CreatePlaylist): Observable<Playlist> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    
    return this.http.post<Playlist>(
      `${this.apiUrl}playlists/create`,
      playlistData,
      { headers }
    );
  }

  addSongToPlaylist(songData: AddRemoveSong): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<any>(
      `${this.apiUrl}playlists/add-song-to-playlist`,
      songData,
      { 
        headers, 
        responseType: 'text' as 'json'
      }
    );
  }

  removeSongFromPlaylist(songData: AddRemoveSong): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete<any>(
      `${this.apiUrl}playlists/remove-song-from-playlist`,
      {
        headers,
        body: songData,
        responseType: 'text' as 'json'
      }
    );
  }

  deletePlaylist(playlistId: string): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<any>(
      `${this.apiUrl}playlists/delete/${playlistId}`,
      { 
        headers , 
        responseType: 'text' as 'json'
      }
    );
  }

  getSongsFormPlaylist(playlistId: string): Observable<Song[]> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Song[]>(
      `${this.apiUrl}playlists/songs/${playlistId}`,{ headers });
  }

  getOnePlaylist(playlistId: string): Observable<Playlist> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Playlist>(
      `${this.apiUrl}playlists/spotify-by-user/one/${playlistId}`,{ headers });
  }
}
