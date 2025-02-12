import { Injectable } from '@angular/core';
import { environment } from '../../../environments/envirnoment.developement';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Artist } from '../models/Artist.model';
import { Song } from '../models/Song.model';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}


  getArtistById(artistId: string): Observable<Artist> {
    const token = localStorage.getItem('accessToken');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
    });
    
    return this.http.get<Artist>(`${this.apiUrl}artists/one/${artistId}`,  { headers });
  }

  getArtistTopSongs(artistId: string): Observable<Song[]> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
    });
    return this.http.get<Song[]>(`${this.apiUrl}artists/songs/${artistId}`, { headers });
  }
  
}
