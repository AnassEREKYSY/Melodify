import { Injectable } from '@angular/core';
import { environment } from '../../../environments/envirnoment.developement';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Song } from '../models/Song.model';

@Injectable({
  providedIn: 'root'
})
export class SongService {

  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}


  getOneSong(songId: string): Observable<Song> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Song>(
      `${this.apiUrl}songs/one/${songId}`,{ headers });
  }
}
